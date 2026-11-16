const { chromium } = require('playwright');
const SP = (process.argv[2] || '.');
const MOCK = `
window.TRIADA_FIREBASE = { apiKey: 'test', projectId: 'test' };
(() => { let authCb = null, user = null;
  const auth = { onAuthStateChanged(cb) { authCb = cb; setTimeout(() => cb(user), 0); }, getRedirectResult: () => Promise.resolve(),
    signInWithPopup: async () => { user = { uid: 'u1', email: 'me@example.com', displayName: 'Test User' }; authCb(user); }, signInWithRedirect: async () => {},
    signOut: async () => { user = null; authCb(null); } };
  const doc = () => ({ onSnapshot(cb) { let last = null; const tick = async () => { const d = await window.__cloudGet(); const j = JSON.stringify(d); if (j !== last) { last = j; cb({ exists: !!d, data: () => d, metadata: {} }); } };
      tick(); const iv = setInterval(tick, 200); return () => clearInterval(iv); },
    set: async v => { await window.__cloudSet(v); window.__writes = (window.__writes || 0) + 1; } });
  window.firebase = { apps: [], initializeApp() { this.apps.push(1); }, auth: Object.assign(() => auth, { GoogleAuthProvider: function () {} }), firestore: () => ({ collection: () => ({ doc }) }) };
})();`;
(async () => {
  let cloud = null;
  const b = await chromium.launch(); const errs = [];
  const dev = async name => { const ctx = await b.newContext({ viewport: { width: 400, height: 860 } });
    await ctx.exposeFunction('__cloudGet', () => cloud); await ctx.exposeFunction('__cloudSet', v => { cloud = v; });
    await ctx.addInitScript(MOCK); const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(name + ': ' + e.message));
    await pg.goto('http://localhost:8765/index.html'); await pg.waitForTimeout(400); return pg; };
  const A = await dev('A');
  // A: make some cards by reading a post, then log in
  await A.click('[data-tab="read"]'); await A.click('.card[data-act="open"] >> nth=1'); for (let q = 0; q < 5; q++) await A.click(`.q[data-qi="${q}"] .opt >> nth=0`);
  await A.waitForTimeout(300);
  const cardsA = await A.evaluate(() => Object.keys(TriadaApp.state().cards).length);
  await A.click('[data-act="prefs"]'); await A.screenshot({ path: SP + '/s1-signedout.png' });
  await A.click('[data-act="signin"]'); await A.waitForTimeout(5500);
  console.log('A cards', cardsA, '| cloud has', cloud ? Object.keys(JSON.parse(cloud.data).cards).length : 'nothing');
  await A.screenshot({ path: SP + '/s2-signedin.png' });
  // B: different device with its own card + different setting, then log in
  const B = await dev('B');
  await B.click('[data-lang="es"]'); await B.click('[data-tab="read"]'); await B.click('.card[data-act="open"] >> nth=0'); for (let q = 0; q < 5; q++) await B.click(`.q[data-qi="${q}"] .opt >> nth=0`);
  await B.waitForTimeout(300); const cardsB = await B.evaluate(() => Object.keys(TriadaApp.state().cards).length);
  await B.click('[data-act="prefs"]'); await B.click('[data-k="theme"][data-v="dark"]'); await B.waitForTimeout(300);
  await B.click('[data-act="signin"]'); await B.waitForTimeout(6000);
  const nB = await B.evaluate(() => Object.keys(TriadaApp.state().cards).length), nA = await A.evaluate(() => Object.keys(TriadaApp.state().cards).length);
  console.log('B own', cardsB, '→ after sync B', nB, 'A', nA, '(expect', cardsA + cardsB, ')');
  console.log('A theme now', await A.evaluate(() => TriadaApp.state().settings.theme), '| A lang', await A.evaluate(() => TriadaApp.state().settings.lang));
  // delete a card on A -> should vanish on B
  await A.click('[data-tab="cards"]'); const k = await A.getAttribute('[data-act="delcard"] >> nth=0', 'data-k'); await A.click('[data-act="delcard"] >> nth=0');
  await A.waitForTimeout(6000);
  console.log('deleted', k, 'still on B?', await B.evaluate(k => !!TriadaApp.state().cards[k], k), '| cards B', await B.evaluate(() => Object.keys(TriadaApp.state().cards).length));
  // settle: count writes over 3 s (should be 0 → no ping-pong)
  const w0 = (await A.evaluate(() => window.__writes || 0)) + (await B.evaluate(() => window.__writes || 0)); await A.waitForTimeout(3000);
  const w1 = (await A.evaluate(() => window.__writes || 0)) + (await B.evaluate(() => window.__writes || 0)); console.log('writes while idle:', w1 - w0);
  await B.click('[data-act="signout"]'); await B.waitForTimeout(300); console.log('B after signout cards', await B.evaluate(() => Object.keys(TriadaApp.state().cards).length));
  console.log(errs.join('\n') || 'no errors'); await b.close(); })();
