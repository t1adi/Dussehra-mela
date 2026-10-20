# WeSync FastAPI backend

A small SQLite-backed API for the WeSync campus discovery flow: account creation, profiles, interest selection, campus-scoped matches, connection requests, and persistent messages.

## Run locally

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/docs` for the interactive API reference. The database is created at `WESYNC_DB_PATH` on startup. No sample users or fabricated activity counts are seeded. The paired frontend runs at `http://127.0.0.1:5173` and uses this API at `http://127.0.0.1:8000`.

## API flow

1. `POST /api/auth/signup` with `name`, institutional `email`, `department`, `year`, and a password of at least 10 characters. The email domain defines the campus boundary. Generic personal email providers are rejected.
2. `PUT /api/me/interests` with at least three distinct interests.
3. `GET /api/matches` returns same-domain profiles ordered by shared-interest count and a match percentage.
4. `POST /api/connections/{student_id}` sends a request. The recipient can accept it with `POST /api/connections/{connection_id}/accept`.
5. After acceptance, list or send messages at `/api/connections/{connection_id}/messages`.

Except for `/health`, endpoints require `Authorization: Bearer <access_token>`. `POST /api/auth/login` returns a token; `POST /api/auth/logout` revokes the current token. Responses never expose password hashes or session hashes.

## Data and production notes

The presentation suggests an institution-focused community and application-owned profile data. This API scopes discovery by email domain and stores accounts, interests, connections, and messages in SQLite. Domain matching is a prototype boundary, not proof of enrollment. A production deployment should verify institutional email ownership, use HTTPS, set exact CORS origins, add abuse controls and account recovery, and use managed database backups. External Spotify, TMDB, IGDB, and Books APIs are not required for the first matching version.
