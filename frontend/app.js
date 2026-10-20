const API_BASE = (localStorage.getItem('wesync_api_url') || 'http://127.0.0.1:8000').replace(/\/$/, '');
const CATS = {
  Music: ['Indie', 'Hip-hop', 'Lo-fi', 'K-pop', 'Rock', 'Bollywood', 'EDM', 'Classical'],
  Movies: ['Sci-fi', 'Anime', 'Thriller', 'Rom-com', 'Marvel', 'Horror', 'Documentaries', 'Nolan'],
  Games: ['Valorant', 'BGMI', 'Minecraft', 'FIFA', 'Chess', 'Genshin', 'GTA', 'Among Us'],
  Books: ['Fantasy', 'Manga', 'Self-help', 'Mystery', 'Sci-fi reads', 'Non-fiction', 'Poetry', 'Comics'],
  Sports: ['Cricket', 'Football', 'Badminton', 'Gym', 'Basketball', 'Running', 'Table tennis', 'Cycling'],
  Hobbies: ['Photography', 'Coding', 'Travel', 'Cooking', 'Sketching', 'Dance', 'Writing', 'Stargazing'],
};
const catOf = Object.fromEntries(Object.entries(CATS).flatMap(([category, items]) => items.map(item => [item, category])));
const DEPTS = ['CSE', 'ECE', 'Mechanical', 'Civil', 'Biotech', 'Design', 'BBA'];
const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const first = name => (name || '').split(' ')[0];
const initials = name => (name || '?').split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
const ordinal = year => ({ 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' }[year] || `${year}th`);
const state = { user: null, token: localStorage.getItem('wesync_token'), screen: 'auth', authTab: 'login', filter: 'All', query: '', matches: [], connections: [], draft: new Set(), busy: false };

class ApiError extends Error { constructor(message, status = 0) { super(message); this.status = status; } }
async function api(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(`Could not reach the API at ${API_BASE}. Start the FastAPI server and try again.`);
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(typeof data.detail === 'string' ? data.detail : data.detail?.[0]?.msg || 'The request could not be completed.', response.status);
  return data;
}
function setToken(token) { state.token = token; if (token) localStorage.setItem('wesync_token', token); else localStorage.removeItem('wesync_token'); }
function authFailure(error) {
  if (error.status === 401) { setToken(null); state.user = null; state.screen = 'auth'; state.authTab = 'login'; render(); }
  toast(error.message || 'Something went wrong.');
}
async function refreshAppData() {
  const [matches, connections] = await Promise.all([api('/api/matches'), api('/api/connections')]);
  state.matches = matches;
  state.connections = connections;
}
async function startSession(session) {
  setToken(session.access_token);
  state.user = session.user;
  state.draft = new Set(session.user.interests || []);
  if (state.user.interests.length >= 3) {
    state.screen = 'app';
    await refreshAppData();
    location.hash = '#home';
  } else state.screen = 'onboard';
  render();
}

function chip(name) { return `<span class="chip">${esc(name)}</span>`; }
function ring(percent, big = false) {
  const score = Number(percent || 0);
  return `<div class="ring ${big ? 'big' : ''}" style="--p:${score};--c:var(--mint)" aria-label="${score}% match"><b>${score}%</b></div>`;
}
function avatar(student, big = false) {
  return `<div class="avatar ${big ? 'big' : ''}" aria-hidden="true">${esc(initials(student.name))}</div>`;
}
function connectionFor(studentId) { return state.connections.find(item => item.user.id === studentId); }
function pickerHTML(selected) {
  return Object.entries(CATS).map(([category, items]) => `<div class="pick-group"><h3>${esc(category)}</h3><div class="chips">${items.map(item => `<button type="button" class="chip pick ${selected.has(item) ? 'on' : ''}" data-action="toggle" data-i="${esc(item)}">${esc(item)}</button>`).join('')}</div></div>`).join('');
}
function studentCard(student) {
  const shared = student.shared_interests || [];
  const connection = connectionFor(student.id);
  const connected = connection?.status === 'accepted';
  let actionLabel = connected ? 'Message' : connection?.direction === 'incoming' ? 'Review request' : connection ? 'Request sent' : 'Connect';
  let action = connected ? 'msg' : connection?.direction === 'incoming' ? 'connections' : 'connect';
  return `<article class="card"><div class="card-top">${avatar(student)}<div class="who"><h3>${esc(student.name)}</h3><small>${esc(student.department)} · ${ordinal(student.year)} Year</small></div>${ring(student.match_percent)}</div><div><div class="label">Shared interests</div><div class="chips">${shared.length ? shared.slice(0, 4).map(chip).join('') : '<span class="muted">No shared interests yet</span>'}${shared.length > 4 ? `<span class="chip more">+${shared.length - 4}</span>` : ''}</div></div><div class="card-actions"><button class="btn ghost small" data-action="view" data-id="${student.id}">View profile</button><button class="btn small" data-action="${action}" data-id="${student.id}" ${connection && !connected && connection.direction !== 'incoming' ? 'disabled' : ''}>${actionLabel}</button></div></article>`;
}

function authView() {
  const login = state.authTab === 'login';
  return `<section class="auth"><div class="auth-hero"><a class="logo" href="#"><span class="logo-dots"><i></i><i></i></span><span>We<b>Sync</b></span></a><div><h1>Find classmates with <span>shared interests</span></h1><p>Create a profile, choose interests, and review matches within your campus.</p></div></div><div class="auth-side"><div class="auth-card"><h2>${login ? 'Welcome back' : 'Join WeSync'}</h2><p class="sub">${login ? 'Sign in to see your matches.' : 'Create your campus profile.'}</p><div class="tabs" role="tablist"><button class="tab ${login ? 'active' : ''}" data-action="auth-tab" data-tab="login" role="tab">Login</button><button class="tab ${!login ? 'active' : ''}" data-action="auth-tab" data-tab="signup" role="tab">Sign up</button></div><form id="auth-form" novalidate>${login ? '' : `<label class="field"><span>Full name</span><input name="name" required autocomplete="name" placeholder="Your name"></label>`}<label class="field"><span>College email</span><input name="email" type="email" required autocomplete="email" placeholder="you@college.edu"></label>${login ? '' : `<div class="row2"><label class="field"><span>Department</span><select name="dept">${DEPTS.map(dept => `<option>${esc(dept)}</option>`).join('')}</select></label><label class="field"><span>Year</span><select name="year">${[1, 2, 3, 4].map(year => `<option value="${year}">${ordinal(year)} year</option>`).join('')}</select></label></div>`}<label class="field"><span>Password</span><input name="password" type="password" required minlength="10" autocomplete="${login ? 'current-password' : 'new-password'}" placeholder="At least 10 characters"></label><div class="form-error" id="form-error"></div><button class="btn block" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Please wait…' : login ? 'Sign in' : 'Create account'}</button></form></div></div></section>`;
}
function onboardView() {
  return `<div class="onboard"><div class="head"><span class="logo"><span class="logo-dots"><i></i><i></i></span><span>We<b>Sync</b></span></span><h1>What are you into, ${esc(first(state.user.name))}?</h1><p>Pick at least 3 interests. You can change them anytime.</p></div><div class="panel" id="picker">${pickerHTML(state.draft)}</div><div class="sticky-bar"><div class="count"><span id="pick-count">${state.draft.size}</span> selected<small>Pick 3 or more to continue</small></div><button class="btn" data-action="finish-onboard" ${state.draft.size < 3 || state.busy ? 'disabled' : ''}>Find my matches</button></div></div>`;
}
function currentRoute() { const route = location.hash.slice(1); return ['home', 'match', 'profile', 'connections'].includes(route) ? route : 'home'; }
function appView() {
  const route = currentRoute();
  const tab = (id, label) => `<button class="nav-link ${route === id ? 'active' : ''}" data-action="go" data-route="${id}">${label}</button>`;
  const content = route === 'match' ? matchView() : route === 'profile' ? profileView() : route === 'connections' ? connectionsView() : homeView();
  return `<header class="nav"><a class="logo" href="#home"><span class="logo-dots"><i></i><i></i></span><span>We<b>Sync</b></span></a><nav class="nav-links" aria-label="Main">${tab('home', 'Home')}${tab('match', 'Matches')}${tab('connections', `Connections${state.connections.some(c => c.status === 'pending' && c.direction === 'incoming') ? ' ·' : ''}`)}${tab('profile', 'Profile')}</nav><button class="nav-avatar" data-action="go" data-route="profile" aria-label="Your profile">${esc(initials(state.user.name))}</button></header><main id="view">${content}</main>`;
}
function homeView() {
  const people = state.matches.slice(0, 3);
  return `<section class="hero"><div><h1>Welcome, ${esc(first(state.user.name))}</h1><p>Discover students from your campus, ranked by shared interests.</p></div><button class="btn" data-action="go" data-route="match">Browse matches</button></section><div class="section-title"><h2>Students with shared interests</h2><button class="link-btn" data-action="go" data-route="match">See all</button></div><div class="grid">${people.length ? people.map(studentCard).join('') : '<div class="empty">No campus profiles match yet. Invite classmates to join WeSync.</div>'}</div>`;
}
function matchView() {
  const people = filteredMatches();
  const filters = ['All', ...Object.keys(CATS)].map(category => `<button class="pill ${state.filter === category ? 'active' : ''}" data-action="filter" data-cat="${esc(category)}">${esc(category)}</button>`).join('');
  return `<div class="page-head"><h1>Matches</h1><p>Ranked by the interests you have in common.</p></div><div class="toolbar"><input class="search" id="search" type="search" placeholder="Search students or interests" value="${esc(state.query)}" aria-label="Search students"><div class="pills" id="pills">${filters}</div></div><div class="grid" id="grid">${people.length ? people.map(studentCard).join('') : '<div class="empty">No matches found. Try another search or interest.</div>'}</div>`;
}
function filteredMatches() {
  const query = state.query.trim().toLowerCase();
  return state.matches.filter(student => (state.filter === 'All' || student.interests.some(item => catOf[item] === state.filter)) && (!query || student.name.toLowerCase().includes(query) || student.interests.some(item => item.toLowerCase().includes(query))));
}
function profileView() {
  const user = state.user;
  const groups = Object.entries(CATS).map(([category, items]) => {
    const selected = user.interests.filter(item => items.includes(item));
    return selected.length ? `<div class="group-card"><h3>${esc(category)}</h3><div class="chips">${selected.map(chip).join('')}</div></div>` : '';
  }).join('');
  return `<section class="profile-card"><div class="avatar big">${esc(initials(user.name))}</div><div class="info"><h1>${esc(user.name)}</h1><p>${esc(user.department)} · ${ordinal(user.year)} Year</p><p>${esc(user.email)}</p></div><div class="profile-actions"><button class="btn yellow" data-action="edit-interests">Edit interests</button><button class="btn ghost" data-action="logout">Log out</button></div></section><div class="section-title"><h2>My interests</h2></div><div class="interest-groups">${groups}</div>`;
}
function connectionsView() {
  const requests = state.connections.filter(item => item.status === 'pending' && item.direction === 'incoming');
  const accepted = state.connections.filter(item => item.status === 'accepted');
  const row = item => `<article class="card"><div class="card-top">${avatar(item.user)}<div class="who"><h3>${esc(item.user.name)}</h3><small>${esc(item.user.department)} · ${ordinal(item.user.year)} Year</small></div></div><div class="card-actions">${item.status === 'pending' ? `<button class="btn" data-action="accept" data-id="${item.id}">Accept request</button>` : `<button class="btn" data-action="chat-connection" data-id="${item.id}">Message</button>`}</div></article>`;
  return `<div class="page-head"><h1>Connections</h1><p>Manage requests and message students you have connected with.</p></div>${requests.length ? `<div class="section-title"><h2>Incoming requests</h2></div><div class="grid">${requests.map(row).join('')}</div>` : ''}<div class="section-title"><h2>Connected</h2></div><div class="grid">${accepted.length ? accepted.map(row).join('') : '<div class="empty">No accepted connections yet.</div>'}</div>`;
}
function openModal(html, wide = false) { const card = $('#modal-card'); card.className = `modal-card${wide ? ' wide' : ''}`; card.innerHTML = `<button class="modal-close" data-action="close" aria-label="Close"></button>${html}`; $('#modal').hidden = false; document.body.style.overflow = 'hidden'; }
function closeModal() { $('#modal').hidden = true; document.body.style.overflow = ''; }
function profileModal(student) {
  const connection = connectionFor(student.id);
  const shared = student.shared_interests || [];
  const other = student.interests.filter(item => !shared.includes(item));
  const action = connection?.status === 'accepted' ? 'msg' : connection?.direction === 'incoming' ? 'connections' : 'connect';
  const label = connection?.status === 'accepted' ? 'Message' : connection?.direction === 'incoming' ? 'Review request' : connection ? 'Request sent' : 'Connect';
  openModal(`<div class="modal-head">${avatar(student, true)}<div style="flex:1"><h2>${esc(student.name)}</h2><small>${esc(student.department)} · ${ordinal(student.year)} Year</small></div>${ring(student.match_percent, true)}</div><div class="modal-section"><div class="label">Shared interests (${shared.length})</div><div class="chips">${shared.length ? shared.map(chip).join('') : '<span class="muted">No shared interests yet.</span>'}</div></div>${other.length ? `<div class="modal-section"><div class="label">Other interests</div><div class="chips">${other.map(chip).join('')}</div></div>` : ''}<div class="modal-actions"><button class="btn ghost" data-action="close">Close</button><button class="btn" data-action="${action}" data-id="${student.id}" ${connection && action === 'connect' ? 'disabled' : ''}>${label}</button></div>`);
}
function chatModal(connection) {
  const logHTML = messages => messages.length ? messages.map(message => `<div class="bubble ${message.sender_id === state.user.id ? 'me' : 'them'}">${esc(message.body)}</div>`).join('') : '<div class="chat-empty">Start the conversation.</div>';
  openModal(`<div class="modal-head">${avatar(connection.user)}<div><h2>${esc(first(connection.user.name))}</h2><small>${esc(connection.user.department)} · ${ordinal(connection.user.year)} Year</small></div></div><div class="chat-log" id="chat-log"><div class="chat-empty">Loading messages…</div></div><form class="chat-form" id="chat-form" data-id="${connection.id}"><input name="msg" placeholder="Write a message" autocomplete="off" aria-label="Message" maxlength="2000"><button class="btn small" type="submit">Send</button></form>`);
  loadMessages(connection.id, logHTML);
}
async function loadMessages(connectionId, logHTML) {
  try { const messages = await api(`/api/connections/${connectionId}/messages`); const log = $('#chat-log'); if (log && !$('#modal').hidden) { log.innerHTML = logHTML(messages); log.scrollTop = log.scrollHeight; } }
  catch (error) { toast(error.message); }
}
function editInterestsModal() {
  state.draft = new Set(state.user.interests);
  openModal(`<h2 style="margin-bottom:6px">Edit your interests</h2><p style="color:var(--muted);margin-bottom:18px">Pick at least 3.</p><div id="picker">${pickerHTML(state.draft)}</div><div class="modal-actions"><button class="btn ghost" data-action="close">Cancel</button><button class="btn" data-action="save-interests" ${state.draft.size < 3 ? 'disabled' : ''}>Save</button></div>`, true);
}
let toastTimer;
function toast(message) { const element = $('#toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('show'), 3600); }
function render() { $('#root').innerHTML = state.screen === 'auth' ? authView() : state.screen === 'onboard' ? onboardView() : appView(); }
async function handleAuth(form) {
  const values = Object.fromEntries(new FormData(form));
  const error = $('#form-error');
  const email = (values.email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) { error.textContent = 'Enter a valid college email address.'; return; }
  if (!values.password || values.password.length < 10) { error.textContent = 'Password needs at least 10 characters.'; return; }
  state.busy = true; render();
  try {
    let session;
    if (state.authTab === 'signup') {
      if (!values.name?.trim()) throw new ApiError('Enter your name.');
      session = await api('/api/auth/signup', { method: 'POST', body: { name: values.name.trim(), email, password: values.password, department: values.dept, year: Number(values.year) } });
    } else session = await api('/api/auth/login', { method: 'POST', body: { email, password: values.password } });
    await startSession(session);
  } catch (err) { state.busy = false; render(); const formError = $('#form-error'); if (formError) formError.textContent = err.message; }
  finally { state.busy = false; }
}
async function finishInterests() {
  if (state.draft.size < 3) return;
  state.busy = true; render();
  try {
    const result = await api('/api/me/interests', { method: 'PUT', body: { interests: [...state.draft] } });
    state.user.interests = result.interests;
    await refreshAppData();
    state.screen = 'app'; location.hash = '#home'; render();
  } catch (error) { state.busy = false; render(); authFailure(error); }
  finally { state.busy = false; }
}
async function loadSession() {
  if (!state.token) { render(); return; }
  try {
    state.user = await api('/api/me');
    state.draft = new Set(state.user.interests || []);
    if (state.user.interests.length >= 3) { state.screen = 'app'; await refreshAppData(); location.hash = '#home'; }
    else state.screen = 'onboard';
  } catch (error) { if (error.status !== 401) toast(error.message); else setToken(null); }
  render();
}
function connectionForStudent(studentId) { return connectionFor(studentId); }
async function connect(studentId) {
  try { await api(`/api/connections/${studentId}`, { method: 'POST' }); await refreshAppData(); render(); toast('Connection request sent.'); }
  catch (error) { authFailure(error); }
}
async function accept(connectionId) {
  try { await api(`/api/connections/${connectionId}/accept`, { method: 'POST' }); await refreshAppData(); render(); toast('Connection accepted.'); }
  catch (error) { authFailure(error); }
}
async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* Clear local token even if server is unavailable. */ }
  setToken(null); state.user = null; state.matches = []; state.connections = []; state.screen = 'auth'; state.authTab = 'login'; location.hash = ''; render();
}

window.addEventListener('hashchange', () => { if (state.screen === 'app') render(); });
document.addEventListener('click', async event => {
  const element = event.target.closest('[data-action]'); if (!element) return;
  const id = Number(element.dataset.id);
  switch (element.dataset.action) {
    case 'auth-tab': state.authTab = element.dataset.tab; render(); break;
    case 'go': closeModal(); location.hash = `#${element.dataset.route}`; render(); break;
    case 'filter': state.filter = element.dataset.cat; $('#pills').innerHTML = ['All', ...Object.keys(CATS)].map(category => `<button class="pill ${state.filter === category ? 'active' : ''}" data-action="filter" data-cat="${esc(category)}">${esc(category)}</button>`).join(''); { const people = filteredMatches(); $('#grid').innerHTML = people.length ? people.map(studentCard).join('') : '<div class="empty">No matches found. Try another search or interest.</div>'; } break;
    case 'view': { const student = state.matches.find(item => item.id === id); if (student) profileModal(student); break; }
    case 'connect': await connect(id); break;
    case 'connections': closeModal(); location.hash = '#connections'; render(); break;
    case 'accept': await accept(id); break;
    case 'msg': { const connection = connectionForStudent(id); if (connection?.status === 'accepted') chatModal(connection); break; }
    case 'chat-connection': { const connection = state.connections.find(item => item.id === id); if (connection) chatModal(connection); break; }
    case 'toggle': { const interest = element.dataset.i; state.draft.has(interest) ? state.draft.delete(interest) : state.draft.add(interest); element.classList.toggle('on'); const count = $('#pick-count'); if (count) count.textContent = state.draft.size; const save = $('[data-action="save-interests"]'); if (save) save.disabled = state.draft.size < 3; const finish = $('[data-action="finish-onboard"]'); if (finish) finish.disabled = state.draft.size < 3; break; }
    case 'finish-onboard': await finishInterests(); break;
    case 'edit-interests': editInterestsModal(); break;
    case 'save-interests': {
      state.busy = true; element.disabled = true;
      try { const result = await api('/api/me/interests', { method: 'PUT', body: { interests: [...state.draft] } }); state.user.interests = result.interests; await refreshAppData(); closeModal(); render(); toast('Interests updated.'); }
      catch (error) { authFailure(error); }
      finally { state.busy = false; }
      break;
    }
    case 'logout': await logout(); break;
    case 'close': closeModal(); break;
  }
});
document.addEventListener('submit', async event => {
  event.preventDefault();
  if (event.target.id === 'auth-form') { await handleAuth(event.target); return; }
  if (event.target.id === 'chat-form') {
    const form = event.target; const connectionId = Number(form.dataset.id); const input = form.elements.msg; const body = input.value.trim(); if (!body) return;
    const button = form.querySelector('button'); button.disabled = true;
    try { await api(`/api/connections/${connectionId}/messages`, { method: 'POST', body: { body } }); input.value = ''; await loadMessages(connectionId, messages => messages.map(message => `<div class="bubble ${message.sender_id === state.user.id ? 'me' : 'them'}">${esc(message.body)}</div>`).join('') || '<div class="chat-empty">Start the conversation.</div>'); }
    catch (error) { toast(error.message); }
    finally { button.disabled = false; input.focus(); }
  }
});
document.addEventListener('input', event => { if (event.target.id === 'search') { state.query = event.target.value; const people = filteredMatches(); $('#grid').innerHTML = people.length ? people.map(studentCard).join('') : '<div class="empty">No matches found. Try another search or interest.</div>'; } });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('#modal').hidden) closeModal(); });
loadSession();
