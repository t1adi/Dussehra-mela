"""WeSync API: campus scoped accounts, profiles, matching, connections and chat."""
from __future__ import annotations

import hashlib
import hmac
import os
import re
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Generator, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, field_validator

DB_PATH = Path(os.getenv("WESYNC_DB_PATH", Path(__file__).parent / "wesync.db"))
ITERATIONS = 310_000
app = FastAPI(title="WeSync API", version="1.0.0", description="Campus profile, interest matching and connection API")
origins = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["GET", "POST", "PUT", "DELETE"], allow_headers=["Authorization", "Content-Type"])


@contextmanager
def db() -> Generator[sqlite3.Connection, None, None]:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with db() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
          campus TEXT NOT NULL, department TEXT NOT NULL, year INTEGER NOT NULL,
          password_hash TEXT NOT NULL, created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sessions (
          token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS interests (
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL, PRIMARY KEY(user_id, name)
        );
        CREATE TABLE IF NOT EXISTS connections (
          id INTEGER PRIMARY KEY, requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL,
          UNIQUE(requester_id, recipient_id), CHECK(requester_id != recipient_id)
        );
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY, connection_id INTEGER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
          sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          body TEXT NOT NULL, created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS ix_users_campus ON users(campus);
        CREATE INDEX IF NOT EXISTS ix_messages_connection ON messages(connection_id, id);
        """)


@app.on_event("startup")
def startup() -> None:
    init_db()


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def password_hash(password: str, salt: Optional[bytes] = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return f"{salt.hex()}${digest.hex()}"


def check_password(password: str, stored: str) -> bool:
    salt_hex, digest_hex = stored.split("$", 1)
    return hmac.compare_digest(password_hash(password, bytes.fromhex(salt_hex)).split("$", 1)[1], digest_hex)


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)


class Signup(Credentials):
    name: str = Field(min_length=2, max_length=80)
    department: str = Field(min_length=1, max_length=80)
    year: int = Field(ge=1, le=8)

    @field_validator("name", "department")
    @classmethod
    def trim_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be blank")
        return value


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    department: str = Field(min_length=1, max_length=80)
    year: int = Field(ge=1, le=8)


class InterestUpdate(BaseModel):
    interests: list[str] = Field(min_length=3, max_length=40)

    @field_validator("interests")
    @classmethod
    def clean_interests(cls, values: list[str]) -> list[str]:
        cleaned = list(dict.fromkeys(v.strip() for v in values if v.strip()))
        if len(cleaned) < 3 or any(len(v) > 60 for v in cleaned):
            raise ValueError("Provide at least three distinct interests, each under 60 characters")
        return cleaned


class MessageInput(BaseModel):
    body: str = Field(min_length=1, max_length=2000)

    @field_validator("body")
    @classmethod
    def trim_body(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Message cannot be blank")
        return value


def current_user(authorization: Optional[str] = Header(default=None)) -> sqlite3.Row:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Bearer token required")
    token = authorization[7:].strip()
    with db() as c:
        row = c.execute("SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?", (hashlib.sha256(token.encode()).hexdigest(),)).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="Session is invalid or expired")
    return row


def interests_for(c: sqlite3.Connection, user_id: int) -> list[str]:
    return [r[0] for r in c.execute("SELECT name FROM interests WHERE user_id=? ORDER BY name COLLATE NOCASE", (user_id,))]


def user_public(c: sqlite3.Connection, user: sqlite3.Row, include_email: bool = False) -> dict:
    data = {"id": user["id"], "name": user["name"], "department": user["department"], "year": user["year"], "interests": interests_for(c, user["id"])}
    if include_email:
        data["email"] = user["email"]
    return data


def connection_for(c: sqlite3.Connection, a: int, b: int) -> Optional[sqlite3.Row]:
    return c.execute("SELECT * FROM connections WHERE (requester_id=? AND recipient_id=?) OR (requester_id=? AND recipient_id=?)", (a, b, b, a)).fetchone()


def require_connection(c: sqlite3.Connection, a: int, b: int) -> sqlite3.Row:
    row = connection_for(c, a, b)
    if row is None or row["status"] != "accepted":
        raise HTTPException(status_code=403, detail="An accepted connection is required")
    return row


@app.get("/health", tags=["system"])
def health() -> dict:
    return {"status": "ok", "service": "wesync-api"}


@app.post("/api/auth/signup", status_code=201, tags=["auth"])
def signup(data: Signup) -> dict:
    email = str(data.email).lower().strip()
    campus = email.rsplit("@", 1)[1].lower()
    if campus in {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"}:
        raise HTTPException(422, "Use your institution-issued email address")
    try:
        with db() as c:
            cur = c.execute("INSERT INTO users(name,email,campus,department,year,password_hash,created_at) VALUES(?,?,?,?,?,?,?)", (data.name.strip(), email, campus, data.department.strip(), data.year, password_hash(data.password), now()))
            uid = cur.lastrowid
    except sqlite3.IntegrityError:
        raise HTTPException(409, "An account already exists for this email")
    return issue_session(uid)


def issue_session(user_id: int) -> dict:
    token = secrets.token_urlsafe(36)
    with db() as c:
        c.execute("INSERT INTO sessions(token_hash,user_id,created_at) VALUES(?,?,?)", (hashlib.sha256(token.encode()).hexdigest(), user_id, now()))
        user = c.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
        return {"access_token": token, "token_type": "bearer", "user": user_public(c, user, True)}


@app.post("/api/auth/login", tags=["auth"])
def login(data: Credentials) -> dict:
    with db() as c:
        user = c.execute("SELECT * FROM users WHERE email=?", (str(data.email).lower().strip(),)).fetchone()
    if user is None or not check_password(data.password, user["password_hash"]):
        raise HTTPException(401, "Email or password is incorrect")
    return issue_session(user["id"])


@app.post("/api/auth/logout", status_code=204, tags=["auth"])
def logout(user: sqlite3.Row = Depends(current_user), authorization: Optional[str] = Header(default=None)) -> Response:
    token = authorization[7:].strip()
    with db() as c:
        c.execute("DELETE FROM sessions WHERE token_hash=?", (hashlib.sha256(token.encode()).hexdigest(),))
    return Response(status_code=204)


@app.get("/api/me", tags=["profiles"])
def get_me(user: sqlite3.Row = Depends(current_user)) -> dict:
    with db() as c:
        return user_public(c, user, True)


@app.put("/api/me", tags=["profiles"])
def update_me(data: ProfileUpdate, user: sqlite3.Row = Depends(current_user)) -> dict:
    with db() as c:
        c.execute("UPDATE users SET name=?,department=?,year=? WHERE id=?", (data.name.strip(), data.department.strip(), data.year, user["id"]))
        updated = c.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
        return user_public(c, updated, True)


@app.put("/api/me/interests", tags=["profiles"])
def update_interests(data: InterestUpdate, user: sqlite3.Row = Depends(current_user)) -> dict:
    with db() as c:
        c.execute("DELETE FROM interests WHERE user_id=?", (user["id"],))
        c.executemany("INSERT INTO interests(user_id,name) VALUES(?,?)", [(user["id"], name) for name in data.interests])
        return {"interests": interests_for(c, user["id"])}


@app.get("/api/matches", tags=["discovery"])
def matches(q: Optional[str] = None, limit: int = 30, me: sqlite3.Row = Depends(current_user)) -> list[dict]:
    limit = max(1, min(limit, 100))
    with db() as c:
        mine = set(interests_for(c, me["id"]))
        if not mine:
            return []
        peers = c.execute("SELECT * FROM users WHERE campus=? AND id!=? ORDER BY name COLLATE NOCASE", (me["campus"], me["id"])).fetchall()
        results = []
        for peer in peers:
            their = interests_for(c, peer["id"])
            shared = sorted(mine.intersection(their), key=str.casefold)
            if q and q.strip().lower() not in peer["name"].lower() and not any(q.strip().lower() in interest.lower() for interest in their):
                continue
            conn = connection_for(c, me["id"], peer["id"])
            result = user_public(c, peer)
            result.update({"shared_interests": shared, "match_percent": round(len(shared) / len(mine) * 100), "connection_status": conn["status"] if conn else None, "connection_direction": "outgoing" if conn and conn["requester_id"] == me["id"] else "incoming" if conn else None})
            results.append(result)
        results.sort(key=lambda x: (-len(x["shared_interests"]), x["name"].casefold()))
        return results[:limit]


@app.get("/api/profiles/{user_id}", tags=["discovery"])
def profile(user_id: int, me: sqlite3.Row = Depends(current_user)) -> dict:
    with db() as c:
        peer = c.execute("SELECT * FROM users WHERE id=? AND campus=?", (user_id, me["campus"])).fetchone()
        if peer is None:
            raise HTTPException(404, "Profile not found")
        data = user_public(c, peer)
        mine = set(interests_for(c, me["id"]))
        shared = sorted(mine.intersection(data["interests"]), key=str.casefold)
        data.update({"shared_interests": shared, "match_percent": round(len(shared) / len(mine) * 100) if mine else 0})
        return data


@app.get("/api/connections", tags=["connections"])
def list_connections(me: sqlite3.Row = Depends(current_user)) -> list[dict]:
    with db() as c:
        rows = c.execute("SELECT * FROM connections WHERE requester_id=? OR recipient_id=? ORDER BY id DESC", (me["id"], me["id"])).fetchall()
        result = []
        for row in rows:
            other_id = row["recipient_id"] if row["requester_id"] == me["id"] else row["requester_id"]
            other = c.execute("SELECT * FROM users WHERE id=?", (other_id,)).fetchone()
            result.append({"id": row["id"], "status": row["status"], "direction": "outgoing" if row["requester_id"] == me["id"] else "incoming", "created_at": row["created_at"], "user": user_public(c, other)})
        return result


@app.post("/api/connections/{other_id}", status_code=201, tags=["connections"])
def request_connection(other_id: int, me: sqlite3.Row = Depends(current_user)) -> dict:
    with db() as c:
        peer = c.execute("SELECT id FROM users WHERE id=? AND campus=?", (other_id, me["campus"])).fetchone()
        if peer is None or other_id == me["id"]:
            raise HTTPException(404, "Student not found")
        existing = connection_for(c, me["id"], other_id)
        if existing:
            if existing["status"] == "pending" and existing["recipient_id"] == me["id"]:
                c.execute("UPDATE connections SET status='accepted' WHERE id=?", (existing["id"],))
                return {"id": existing["id"], "status": "accepted"}
            raise HTTPException(409, "A connection request already exists")
        cur = c.execute("INSERT INTO connections(requester_id,recipient_id,status,created_at) VALUES(?,?,?,?)", (me["id"], other_id, "pending", now()))
        return {"id": cur.lastrowid, "status": "pending"}


@app.post("/api/connections/{connection_id}/accept", tags=["connections"])
def accept_connection(connection_id: int, me: sqlite3.Row = Depends(current_user)) -> dict:
    with db() as c:
        row = c.execute("SELECT * FROM connections WHERE id=? AND recipient_id=? AND status='pending'", (connection_id, me["id"])).fetchone()
        if row is None:
            raise HTTPException(404, "Pending request not found")
        c.execute("UPDATE connections SET status='accepted' WHERE id=?", (connection_id,))
        return {"id": connection_id, "status": "accepted"}


def connection_by_id(c: sqlite3.Connection, connection_id: int, user_id: int) -> sqlite3.Row:
    row = c.execute("SELECT * FROM connections WHERE id=? AND (requester_id=? OR recipient_id=?)", (connection_id, user_id, user_id)).fetchone()
    if row is None:
        raise HTTPException(404, "Connection not found")
    if row["status"] != "accepted":
        raise HTTPException(403, "Connection request has not been accepted")
    return row


@app.get("/api/connections/{connection_id}/messages", tags=["messages"])
def get_messages(connection_id: int, me: sqlite3.Row = Depends(current_user)) -> list[dict]:
    with db() as c:
        connection_by_id(c, connection_id, me["id"])
        rows = c.execute("SELECT m.*,u.name AS sender_name FROM messages m JOIN users u ON u.id=m.sender_id WHERE connection_id=? ORDER BY m.id", (connection_id,)).fetchall()
        return [{"id": r["id"], "sender_id": r["sender_id"], "sender_name": r["sender_name"], "body": r["body"], "created_at": r["created_at"]} for r in rows]


@app.post("/api/connections/{connection_id}/messages", status_code=201, tags=["messages"])
def send_message(connection_id: int, data: MessageInput, me: sqlite3.Row = Depends(current_user)) -> dict:
    with db() as c:
        connection_by_id(c, connection_id, me["id"])
        cur = c.execute("INSERT INTO messages(connection_id,sender_id,body,created_at) VALUES(?,?,?,?)", (connection_id, me["id"], data.body, now()))
        return {"id": cur.lastrowid, "sender_id": me["id"], "sender_name": me["name"], "body": data.body, "created_at": now()}

