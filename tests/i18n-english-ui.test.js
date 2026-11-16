const { chromium } = require('playwright');
const SP = (process.argv[2] || '.');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 400, height: 860 } });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await ctx.route(/mymemory|wiki/, r => r.abort());
  await pg.goto('http://localhost:8765/index.html'); await pg.waitForTimeout(500);
  await pg.click('[data-act="prefs"]'); await pg.click('[data-k="uiLang"][data-v="en"]'); await pg.waitForTimeout(200);
  const leftovers = new Set();
  const scan = async name => { const r = await pg.evaluate(() => { const C = '.rt,.c,.sh-mean,.sh-mean2:not(.ui),.sh-sent .o,.sh-sent .t,.sh-phrase div,.entry .m,.exs,.wd>div,.fc .mean,.fc .ex,.qth,.xq,.cover p,textarea,input';
      const out = []; const w = document.createTreeWalker(document.getElementById('app'), NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { if (/[฀-๿]/.test(n.nodeValue) && !n.parentElement.closest(C) && n.parentElement.offsetParent !== null) out.push(n.nodeValue.trim()); }
      document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(e => ['placeholder','aria-label','title'].forEach(a => { const v = e.getAttribute(a); if (v && /[฀-๿]/.test(v)) out.push('@' + a + ':' + v); }));
      return out; }); r.forEach(x => leftovers.add(name + ' | ' + x)); };
  await scan('prefs'); await pg.screenshot({ path: SP + '/e1-prefs.png' });
  await pg.click('[data-tab="feed"]'); await pg.waitForTimeout(300); await scan('feed'); await pg.screenshot({ path: SP + '/e2-feed.png' });
  await pg.click('.post .w >> nth=3'); await pg.waitForTimeout(300); await scan('sheet'); await pg.screenshot({ path: SP + '/e3-sheet.png' }); await pg.click('[data-act="closesheet"]');
  await pg.click('[data-tab="read"]'); await scan('read'); await pg.click('.card[data-act="open"] >> nth=1'); await pg.waitForTimeout(200);
  for (let q = 0; q < 5; q++) await pg.click(`.q[data-qi="${q}"] .opt >> nth=0`); await pg.waitForTimeout(300); await scan('article'); await pg.screenshot({ path: SP + '/e4-quiz.png' });
  await pg.click('.back'); await pg.click('[data-act="live"]'); await pg.waitForTimeout(300); await scan('live');
  await pg.click('[data-act="livetab"][data-v="paste"]'); await scan('paste');
  await pg.fill('#pasteText', "Le prix de l'électricité va augmenter de dix pour cent en février, a annoncé le gouvernement. Les ménages les plus modestes recevront une aide exceptionnelle. Les associations de consommateurs dénoncent une hausse injuste."); await pg.click('[data-act="pastego"]'); await pg.waitForTimeout(300);
  for (let q = 0; q < 5; q++) { const o = await pg.$(`.q[data-qi="${q}"] .opt`); if (o) await o.click(); } await scan('webarticle'); await pg.screenshot({ path: SP + '/e5-web.png' });
  await pg.click('.back'); await pg.click('[data-act="livetab"][data-v="saved"]'); await scan('saved');
  await pg.click('[data-tab="novel"]'); await scan('novel'); await pg.screenshot({ path: SP + '/e6-novel.png' }); await pg.click('.cover >> nth=0'); await scan('story');
  await pg.click('[data-tab="cards"]'); await scan('cards'); await pg.click('[data-act="review"]'); await scan('review-front'); await pg.click('.fc'); await pg.waitForTimeout(400); await scan('review-back'); await pg.screenshot({ path: SP + '/e7-review.png' });
  for (let i = 0; i < 40; i++) { const g = await pg.$('[data-act="grade"][data-q="0"]'); if (!g) break; await g.click(); const f = await pg.$('.fc:not(.flip)'); if (f) await f.click(); }
  await scan('review-end');
  await pg.click('[data-tab="dict"]'); await scan('dict'); await pg.fill('#dictInput', 'zzqx'); await pg.waitForTimeout(300); await scan('dict-miss'); await pg.fill('#dictInput', 'maison'); await pg.waitForTimeout(200); await scan('dict-hit'); await pg.screenshot({ path: SP + '/e8-dict.png' });
  await pg.click('[data-act="prefs"]'); await pg.click('[data-k="uiLang"][data-v="th"]'); await pg.waitForTimeout(200);
  console.log('back to thai, tab label:', await pg.textContent('[data-tab="feed"] span'), '| lang attr', await pg.evaluate(() => document.documentElement.lang));
  console.log([...leftovers].join('\n') || 'NO THAI LEFT IN UI'); console.log(errs.join('\n') || 'no errors');
  await b.close(); })();
