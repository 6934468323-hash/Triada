/* ---------- account & cross-device sync (Firebase Auth + Firestore) ----------
   Spliced into app.js at build time (shares its scope). Login is optional: without it the app stays fully local.
   One Firestore document per user (users/{uid}) holds the whole progress as JSON; devices merge field by field. */
const FB_CFG = window.TRIADA_FIREBASE && window.TRIADA_FIREBASE.apiKey ? window.TRIADA_FIREBASE : null;
const FB_VER = '10.12.2';
const CLIENT_ID = (() => { try { let c = localStorage.getItem('triada.client'); if (!c) { c = Math.random().toString(36).slice(2, 10); localStorage.setItem('triada.client', c); } return c; } catch (e) { return 'x' + Math.random().toString(36).slice(2, 8); } })();
const SYNC_KEYS = ['cards', 'read', 'quiz', 'likes', 'history', 'novelPos', 'web', 'deleted', 'settings', 'settingsAt'];
const sync = { fb: null, user: null, unsub: null, status: 'off', last: 0, err: '', pushT: null, applying: false, loading: null };

function stableJSON(o) { return JSON.stringify(o, (k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((r, x) => (r[x] = v[x], r), {}) : v); }
const pick = (x, y, tx, ty) => tx !== ty ? (tx > ty ? x : y) : (stableJSON(x) >= stableJSON(y) ? x : y);
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('โหลด ' + src + ' ไม่สำเร็จ')); document.head.appendChild(s); }); }
function fbInit(silent) {
  if (!FB_CFG || FRAMED) return Promise.resolve(null);
  if (sync.fb) return Promise.resolve(sync.fb);
  if (sync.loading) return sync.loading;
  sync.loading = (async () => {
    if (!window.firebase) for (const m of ['app', 'auth', 'firestore']) await loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-${m}-compat.js`);
    if (!firebase.apps.length) firebase.initializeApp(FB_CFG);
    sync.fb = { auth: firebase.auth(), db: firebase.firestore() };
    sync.fb.auth.onAuthStateChanged(u => { sync.user = u; if (u) startSync(); else stopSync(); accountChanged(); });
    sync.fb.auth.getRedirectResult().catch(e => { sync.err = e.code || e.message; accountChanged(); });
    return sync.fb;
  })().catch(e => { sync.loading = null; if (!silent) { sync.err = e.message; accountChanged(); } return null; });
  return sync.loading;
}
async function signIn() {
  const fb = await fbInit(); if (!fb) { toast(navigator.onLine ? 'เชื่อมต่อระบบบัญชีไม่สำเร็จ' : 'ต้องใช้อินเทอร์เน็ตเพื่อเข้าสู่ระบบ'); return; }
  const prov = new firebase.auth.GoogleAuthProvider();
  try { await fb.auth.signInWithPopup(prov); }
  catch (e) {
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(e.code)) { try { await fb.auth.signInWithRedirect(prov); return; } catch (e2) { e = e2; } }
    if (e.code !== 'auth/popup-closed-by-user') { sync.err = e.code || e.message; toast('เข้าสู่ระบบไม่สำเร็จ'); accountChanged(); }
  }
}
async function signOut() { if (sync.fb) { await sync.fb.auth.signOut(); toast('ออกจากระบบแล้ว ข้อมูลในเครื่องนี้ยังอยู่ครบ'); } }

function userDoc() { return sync.fb.db.collection('users').doc(sync.user.uid); }
function cloudPayload() { const o = {}; for (const k of SYNC_KEYS) o[k] = S[k]; return o; }
function startSync() {
  stopSync(); sync.status = 'syncing'; sync.err = '';
  sync.unsub = userDoc().onSnapshot(snap => {
    if (snap.metadata && snap.metadata.hasPendingWrites) return;
    const d = snap.exists ? snap.data() : null;
    let remote = null; try { remote = d && d.data ? JSON.parse(d.data) : null; } catch (e) { remote = null; }
    if (remote) sync.cloud = stableJSON(remote);
    if (remote && d.client !== CLIENT_ID) {
      const before = stableJSON(cloudPayload());
      Object.assign(S, mergeState(cloudPayload(), remote));
      lastSettingsJSON = JSON.stringify(S.settings);
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
      if (stableJSON(cloudPayload()) !== before) remoteApplied();
      schedulePush(500);
    } else if (!remote) schedulePush(0);
    sync.status = 'ok'; sync.last = Date.now(); accountChanged();
  }, e => { sync.status = 'error'; sync.err = e.code || e.message; accountChanged(); });
}
function stopSync() { if (sync.unsub) { sync.unsub(); sync.unsub = null; } clearTimeout(sync.pushT); sync.status = 'off'; }
function schedulePush(ms) {
  if (!sync.user) return;
  clearTimeout(sync.pushT);
  sync.pushT = setTimeout(pushNow, ms == null ? 4000 : ms);
}
async function pushNow() {
  if (!sync.user) return;
  sync.status = 'syncing'; accountChanged();
  try {
    let json = stableJSON(cloudPayload());
    if (json.length > 900000) { const p = cloudPayload(); p.web = {}; json = stableJSON(p); } // Firestore documents max out at 1 MB
    if (json === sync.cloud) { sync.status = 'ok'; sync.last = Date.now(); accountChanged(); return; }
    sync.cloud = json;
    await userDoc().set({ data: json, client: CLIENT_ID, updatedAt: Date.now() });
    sync.status = 'ok'; sync.last = Date.now(); sync.err = '';
  } catch (e) { sync.status = 'error'; sync.err = e.code || e.message; }
  accountChanged();
}

/* merge two progress snapshots; newest edit wins per item, deletions are tombstones */
function mergeState(a, b) {
  const t = c => (c && (c.upd || c.added)) || 0;
  const del = { ...(b.deleted || {}) };
  for (const k in (a.deleted || {})) del[k] = Math.max(del[k] || 0, a.deleted[k]);
  const cutoff = Date.now() - 120 * 864e5; for (const k in del) if (del[k] < cutoff) delete del[k];
  const cards = {};
  for (const src of [b.cards || {}, a.cards || {}]) for (const k in src) cards[k] = cards[k] ? pick(src[k], cards[k], t(src[k]), t(cards[k])) : src[k];
  for (const k in cards) if ((del['card:' + k] || 0) >= t(cards[k])) delete cards[k];
  const web = { ...(b.web || {}) }; for (const k in (a.web || {})) web[k] = web[k] ? pick(a.web[k], web[k], a.web[k].t || 0, web[k].t || 0) : a.web[k];
  for (const k in web) if ((del['web:' + k] || 0) >= (web[k].t || 0)) delete web[k];
  const read = { ...(b.read || {}) }; for (const k in (a.read || {})) read[k] = Math.max(read[k] || 0, a.read[k]);
  const quiz = { ...(b.quiz || {}) };
  for (const k in (a.quiz || {})) { const x = a.quiz[k], y = quiz[k]; quiz[k] = !y ? x : { score: Math.max(x.score, y.score), total: x.total, last: (x.t || 0) > (y.t || 0) ? x.last : (y.t || 0) > (x.t || 0) ? y.last : Math.max(x.last || 0, y.last || 0), t: Math.max(x.t || 0, y.t || 0) }; }
  const novelPos = { ...(b.novelPos || {}) }; for (const k in (a.novelPos || {})) novelPos[k] = Math.max(novelPos[k] || 0, a.novelPos[k]);
  const seen = new Set(), history = [];
  for (const h of [...(a.history || []), ...(b.history || [])].sort((x, y) => y.t - x.t || (x.lang + x.w < y.lang + y.w ? -1 : 1))) { const k = h.lang + h.w; if (!seen.has(k)) { seen.add(k); history.push(h); } }
  const sa = a.settings || {}, sb = b.settings || {};
  const settings = pick(sa, sb, a.settingsAt || 0, b.settingsAt || 0);
  return { cards, web, read, quiz, novelPos, history: history.slice(0, 40), likes: Object.fromEntries([...new Set([...Object.keys(a.likes || {}), ...Object.keys(b.likes || {})])].map(k => [k, !!((a.likes || {})[k] || (b.likes || {})[k])])), deleted: del,
    settings: { ...DEFAULTS, ...settings }, settingsAt: Math.max(a.settingsAt || 0, b.settingsAt || 0) };
}
function remoteApplied() {
  for (const it of Object.values(S.web || {})) BYID[it.id] = it;
  applyLook(); updateBadge();
  if (['cards', 'prefs', 'live', 'read', 'novel'].includes(view.name)) { const y = scrollY; render(); scrollTo(0, y); }
}
function accountChanged() { const box = document.getElementById('acctBox'); if (box) box.innerHTML = accountHTML(); }
function accountHTML() {
  if (FRAMED) return `<div class="row"><label>บัญชีและการซิงก์<small>หน้าตัวอย่างบน claude.ai เข้าสู่ระบบไม่ได้ ใช้แอปเวอร์ชัน GitHub Pages</small></label></div>`;
  if (!FB_CFG) return `<div class="row"><label>ยังไม่ได้เปิดใช้การซิงก์<small>ต้องตั้งค่า Firebase ในไฟล์ src/firebase-config.js ก่อน (ดู README)</small></label></div>`;
  const err = sync.err ? `<div class="row"><label><small style="color:var(--bad)">ข้อผิดพลาด: ${esc(sync.err)}</small></label></div>` : '';
  if (!sync.user) return `<div class="row"><label>เข้าสู่ระบบเพื่อซิงก์ข้ามเครื่อง<small>การ์ด ความคืบหน้า การตั้งค่า และข่าวที่บันทึกไว้จะตรงกันทุกเครื่อง · ไม่เข้าสู่ระบบก็ใช้งานได้ตามปกติ</small></label>
      <button class="tbtn primary" data-act="signin">${ic('globe')}เข้าสู่ระบบด้วย Google</button></div>` + err;
  const u = sync.user;
  const st = sync.status === 'syncing' ? 'กำลังซิงก์…' : sync.status === 'error' ? 'ซิงก์ไม่สำเร็จ' : sync.last ? 'ซิงก์ล่าสุด ' + new Date(sync.last).toLocaleTimeString(isEN() ? 'en-GB' : 'th-TH', { hour: '2-digit', minute: '2-digit' }) : 'เชื่อมต่อแล้ว';
  return `<div class="row"><label><span class="c">${esc(u.displayName || u.email || 'Google')}</span><small><span class="c">${esc(u.email || '')}</span> · ${st}</small></label>
      <div class="tools"><button class="tbtn" data-act="syncnow">${ic('refresh')}ซิงก์ตอนนี้</button><button class="tbtn" data-act="signout">ออกจากระบบ</button></div></div>` + err;
}
