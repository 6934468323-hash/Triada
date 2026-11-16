const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 400, height: 860 } }); const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.route(/gstatic|mymemory|wiki/, r => r.abort());
  await pg.goto('http://localhost:8765/index.html'); await pg.waitForTimeout(500);
  const readN = () => pg.evaluate(() => Object.keys(TriadaApp.state().read).length);
  console.log('focus?', await pg.evaluate(() => document.hasFocus()), '| unread label', await pg.textContent('.feedinfo span'));
  // A: flick through the feed quickly (continuous fast scrolling for ~4s)
  for (let i = 0; i < 40; i++) { await pg.mouse.wheel(0, 500); await pg.waitForTimeout(60); }
  await pg.waitForTimeout(300);
  console.log('A flick: read =', await readN(), '(expect 0)');
  // B: go back to first post, let it sit fully on screen
  await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(200);
  const first = await pg.getAttribute('.post >> nth=0', 'data-id');
  await pg.evaluate(id => { const el = document.querySelector(`.post[data-id="${id}"]`); scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); }, first);
  const need = await pg.evaluate(id => { const it = TriadaApp.DB.fr.feed.find(p => p.id === id); return it.lvl + ' ' + it.s.length; }, first);
  let t = 0; while (t < 50 && !(await pg.evaluate(id => !!TriadaApp.state().read[id], first))) { await pg.waitForTimeout(1000); t++; }
  console.log('B dwell on', first, need, '→ read after ~', t, 's');
  await pg.screenshot({ path: 'r1.png' });
  // C: engagement shortens the time - next post, tap a word
  const second = await pg.getAttribute('.post >> nth=1', 'data-id');
  await pg.evaluate(id => { const el = document.querySelector(`.post[data-id="${id}"]`); scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); }, second);
  await pg.click(`.post[data-id="${second}"] .w >> nth=1`); await pg.waitForTimeout(200); await pg.click('[data-act="closesheet"]');
  t = 0; while (t < 50 && !(await pg.evaluate(id => !!TriadaApp.state().read[id], second))) { await pg.waitForTimeout(1000); t++; }
  console.log('C with word tap', second, '→ read after ~', t, 's');
  // D: re-render feed: read posts must not appear
  await pg.click('[data-tab="read"]'); await pg.click('[data-tab="feed"]'); await pg.waitForTimeout(300);
  const ids = await pg.$$eval('.post', x => x.map(e => e.dataset.id));
  console.log('D feed after reload contains read posts?', ids.includes(first) || ids.includes(second), '| label', await pg.textContent('.feedinfo span'));
  // E: story jumped to the end
  await pg.click('[data-tab="novel"]'); await pg.click('.cover >> nth=0'); await pg.waitForTimeout(300);
  await pg.evaluate(() => document.getElementById('storyEnd').scrollIntoView()); await pg.waitForTimeout(800);
  console.log('E story jump: finished?', await pg.evaluate(() => !!TriadaApp.state().read['fr-n1']), '| button', !!(await pg.$('#finishStoryBtn')));
  await pg.click('#finishStoryBtn'); console.log('E manual finish →', await pg.evaluate(() => !!TriadaApp.state().read['fr-n1']));
  console.log(errs.join('\n') || 'no errors'); await b.close(); })();
