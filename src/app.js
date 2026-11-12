/* Tríada Reader — อ่านภาษาฝรั่งเศส สเปน ดัตช์ (ทำงานออฟไลน์ได้ทั้งหมด ยกเว้นฟีเจอร์ที่ระบุว่า "ออนไลน์") */
(function () {
'use strict';

/* ================= constants ================= */
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const rank = l => Math.max(0, LEVELS.indexOf(l));
const LANGS = {
  fr: { name: 'Français', th: 'ฝรั่งเศส', tts: 'fr-FR' },
  es: { name: 'Español', th: 'สเปน', tts: 'es-ES' },
  nl: { name: 'Nederlands', th: 'ดัตช์', tts: 'nl-NL' }
};
const FEED_CATS = { food: 'อาหาร', travel: 'ท่องเที่ยว', life: 'ชีวิตประจำวัน', tech: 'เทคโนโลยี', sport: 'กีฬา', culture: 'บันเทิง', work: 'การงาน', nature: 'ธรรมชาติ' };
const READ_CATS = { science: 'วิทยาศาสตร์', health: 'สุขภาพ', tech: 'เทคโนโลยี', env: 'สิ่งแวดล้อม', society: 'สังคม', economy: 'เศรษฐกิจ', news: 'ข่าว', history: 'ประวัติศาสตร์' };
const GENRES = {
  horror: { th: 'สยองขวัญ', c: '#6B2A3A' }, romance: { th: 'โรแมนติก', c: '#C2367A' }, comedy: { th: 'ตลก', c: '#C98A00' },
  mystery: { th: 'สืบสวน', c: '#2C5D8F' }, fantasy: { th: 'แฟนตาซี', c: '#5B3FB8' }
};
const QTYPES = { main: 'ใจความสำคัญ', detail: 'รายละเอียด', not: 'ข้อใดไม่สอดคล้อง', infer: 'การอนุมาน', vocab: 'ศัพท์ในบริบท', purpose: 'จุดประสงค์ผู้เขียน', tone: 'น้ำเสียง/ทัศนคติ', title: 'ชื่อเรื่องที่เหมาะสม' };
const POS = { n: 'คำนาม', v: 'คำกริยา', adj: 'คุณศัพท์', adv: 'กริยาวิเศษณ์', prep: 'บุพบท', conj: 'คำเชื่อม', pron: 'สรรพนาม', det: 'คำนำหน้า', expr: 'สำนวน', int: 'คำอุทาน', num: 'ตัวเลข' };
const AV_COLORS = ['#3B5BDB', '#C2255C', '#2B8A3E', '#E8590C', '#7048E8', '#0C8599', '#A61E4D', '#5C940D'];

/* ================= icons ================= */
const P = {
  play: '<path d="M7 5v14l12-7z"/>', stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  tr: '<path d="M4 5h9M8.5 3v2M6 5c.8 3.5 3.2 6 6.5 7.5M11 5c-.8 3.6-3.3 6.4-7 8"/><path d="M13 21l4-9 4 9M14.5 18h5"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  chat: '<path d="M5 18l-1 3 4-2h9a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v8a3 3 0 0 0 1 3z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  feed: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="14" width="16" height="6" rx="2"/>',
  quiz: '<path d="M5 4h11l3 3v13H5z"/><path d="M9 10h6M9 14h6M9 18h3"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
  cards: '<rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 4h12a2 2 0 0 1 2 2v11"/>',
  dict: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  speaker: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  save: '<path d="M6 3h12v18l-6-4-6 4z"/>', check: '<path d="M5 12l5 5 9-10"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', shuffle: '<path d="M4 7h3c5 0 5 10 10 10h3M4 17h3c1.6 0 2.6-1 3.4-2.3M14 9.3C14.8 8 15.8 7 17.4 7H20M18 4l3 3-3 3M18 14l3 3-3 3"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>', flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'
};
const ic = (n, extra = '') => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" ${extra}>${P[n] || ''}</svg>`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ================= storage ================= */
const KEY = 'triada.v1';
const DEFAULTS = {
  lang: 'fr', trLang: 'th', theme: 'auto', accent: 'lang', fontSize: 19, lineHeight: 1.75, readFont: 'serif',
  markHard: true, markSaved: true, showTrDefault: false, autoSave: true, saveLevel: 'auto',
  rate: 0.95, voices: {}, cardDir: 'word', sessionSize: 20, online: true,
  feedCats: [], feedLvls: [], readLvls: [], readCat: ''
};
let S = { settings: { ...DEFAULTS }, cards: {}, read: {}, quiz: {}, likes: {}, history: [], novelPos: {}, web: {}, tab: 'feed' };
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); S = { ...S, ...d, settings: { ...DEFAULTS, ...(d.settings || {}) } }; } } catch (e) { }
}
let saveT;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }, 150); }
const st = () => S.settings;

/* ================= data ================= */
const DB = { fr: { base: {}, feed: [], read: [], novel: [] }, es: { base: {}, feed: [], read: [], novel: [] }, nl: { base: {}, feed: [], read: [], novel: [] } };
const DICT = { fr: new Map(), es: new Map(), nl: new Map() };
const BYID = {};
function parseEntry(str) {
  const [lvl, pos, en, th, lemma] = String(str).split('|');
  return { lvl: lvl || '', pos: pos || '', en: en || '', th: th || '', lemma: lemma || '' };
}
function allSentences(item) {
  const out = [];
  if (item.title) out.push(item.title);
  (item.s || []).forEach(x => out.push(x));
  (item.p || []).forEach(p => Array.isArray(p) && p.forEach(x => out.push(x)));
  (item.c || []).forEach(c => c.s.forEach(x => out.push(x)));
  return out;
}
function ingest() {
  (window.TRIADA_DATA || []).forEach(d => {
    const L = DB[d.lang]; if (!L) return;
    Object.assign(L.base, d.base || {});
    ['feed', 'read', 'novel'].forEach(k => (d[k] || []).forEach(it => { if (it.vv) { it.v = Object.assign(it.v || {}, it.vv); delete it.vv; } it.lang = d.lang; it.kind = k; L[k].push(it); BYID[it.id] = it; }));
  });
  for (const lang in DB) {
    const L = DB[lang], M = DICT[lang];
    for (const w in L.base) M.set(w.toLowerCase(), { w, ...parseEntry(L.base[w]), src: [] });
    ['feed', 'read', 'novel'].forEach(k => L[k].forEach(it => {
      for (const w in (it.v || {})) {
        const key = w.toLowerCase(), e = parseEntry(it.v[w]);
        const ex = M.get(key);
        if (ex) { if (!ex.src.includes(it.id)) ex.src.push(it.id); if (rank(e.lvl) > rank(ex.lvl) || !ex.lvl) Object.assign(ex, e, { w, src: ex.src }); }
        else M.set(key, { w, ...e, src: [it.id] });
      }
    }));
  }
}

/* ================= text helpers ================= */
const WORD_RE = /[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)*(?:-[\p{L}\p{M}]+)*/gu;
function tokenize(text) {
  const out = []; let last = 0;
  for (const m of text.matchAll(WORD_RE)) {
    if (m.index > last) out.push({ t: text.slice(last, m.index) });
    out.push({ w: m[0] }); last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: text.slice(last) });
  return out;
}
function candidates(lang, w) {
  const n = w.toLowerCase().replace(/’/g, "'");
  const c = [n];
  if (lang === 'fr') { const m = n.match(/^(l|d|j|qu|n|s|c|m|t|jusqu|lorsqu|puisqu)'(.+)$/); if (m) c.push(m[2]); }
  if (lang === 'nl') { const m = n.match(/^(.+)'s$/); if (m) c.push(m[1]); }
  if (n.includes('-')) c.push(...n.split('-'));
  const more = [];
  for (const x of c) {
    if (lang === 'fr') more.push(x.replace(/s$/, ''), x.replace(/x$/, ''), x.replace(/es$/, ''), x.replace(/e$/, ''), x.replace(/ées?$|és$|ée$/, 'er'), x.replace(/é$/, 'er'), x.replace(/aux$/, 'al'), x.replace(/euses?$/, 'eux'), x.replace(/ives?$/, 'if'), x.replace(/elles?$/, 'el'));
    if (lang === 'es') more.push(x.replace(/s$/, ''), x.replace(/es$/, ''), x.replace(/as?$/, 'o'), x.replace(/os$/, 'o'), x.replace(/ces$/, 'z'));
    if (lang === 'nl') more.push(x.replace(/en$/, ''), x.replace(/s$/, ''), x.replace(/e$/, ''), x.replace(/([bcdfgklmnprstvz])\1en$/, '$1'), x.replace(/t$/, ''), x.replace(/ën$/, 'e'), x.replace(/zen$/, 's'), x.replace(/ven$/, 'f'), x.replace(/en$/, '').replace(/([^aeiou])([aeiou])([^aeiou])$/, '$1$2$2$3'));
  }
  return [...new Set([...c, ...more].filter(Boolean))];
}
function lookup(lang, raw, vocab) {
  const cands = candidates(lang, raw);
  if (vocab) {
    const vk = {}; for (const k in vocab) vk[k.toLowerCase()] = k;
    for (const c of cands) if (vk[c]) { const w = vk[c]; return { w, ...parseEntry(vocab[w]), local: true, ...(DICT[lang].get(c) ? { src: DICT[lang].get(c).src } : {}) }; }
  }
  for (const c of cands) { const e = DICT[lang].get(c); if (e) return e; }
  return null;
}
function headword(e, fallback) { return (e && (e.lemma || e.w)) || fallback.toLowerCase(); }
function cardKey(lang, word) { return lang + ':' + word.toLowerCase(); }
function sentText(s) { return Array.isArray(s) ? s[0] : s; }
function trOf(s, lang) { if (!Array.isArray(s)) return ''; return (lang || st().trLang) === 'en' ? (s[1] || s[2] || '') : (s[2] || s[1] || ''); }

/* ================= TTS ================= */
const synth = window.speechSynthesis;
let voicesCache = [];
function loadVoices() { try { voicesCache = synth ? synth.getVoices() : []; } catch (e) { voicesCache = []; } }
if (synth) { loadVoices(); synth.onvoiceschanged = () => { loadVoices(); if (S.tab === 'prefs') render(); }; }
function voiceFor(lang) {
  const want = st().voices[lang];
  const list = voicesCache.filter(v => v.lang && v.lang.toLowerCase().startsWith(lang));
  return list.find(v => v.voiceURI === want) || list.find(v => v.localService) || list[0] || null;
}
let speakRun = 0;
function speak(text, lang, opts = {}) {
  if (!synth) { toast('อุปกรณ์นี้ไม่รองรับเสียงอ่าน'); return Promise.resolve(); }
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANGS[lang].tts; const v = voiceFor(lang); if (v) u.voice = v;
    u.rate = opts.rate || st().rate; u.onend = res; u.onerror = res;
    synth.speak(u);
  });
}
function stopSpeak() { speakRun++; try { synth && synth.cancel(); } catch (e) { } $$('.sent.speaking').forEach(x => x.classList.remove('speaking')); $$('[data-act="readall"]').forEach(b => { b.innerHTML = ic('play') + 'ฟังทั้งเรื่อง'; b.setAttribute('aria-pressed', 'false'); }); }
async function readAll(container, lang, btn) {
  if (btn.getAttribute('aria-pressed') === 'true') { stopSpeak(); return; }
  stopSpeak(); const run = speakRun;
  btn.setAttribute('aria-pressed', 'true'); btn.innerHTML = ic('stop') + 'หยุด';
  const sents = $$('.sent', container);
  for (const el of sents) {
    if (run !== speakRun) return;
    el.classList.add('speaking'); el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    await speak(el.dataset.text, lang);
    el.classList.remove('speaking');
  }
  if (run === speakRun) stopSpeak();
}

/* ================= rendering of text ================= */
const CTX = new Map(); let ctxSeq = 0;
function makeCtx(item) { const id = 'c' + (++ctxSeq); CTX.set(id, item); return id; }
function hardThreshold(item) {
  const sl = st().saveLevel;
  if (sl !== 'auto') return rank(sl);
  return Math.min(5, Math.max(rank('B1'), rank(item.lvl || 'B1') + 1));
}
function sentenceHTML(s, item, si) {
  const text = sentText(s), lang = item.lang, vocab = item.v || {};
  const thr = hardThreshold(item);
  const words = tokenize(text).map(tk => {
    if (tk.t) return esc(tk.t);
    let cls = 'w';
    if (st().markHard || st().markSaved) {
      const e = lookup(lang, tk.w, vocab);
      if (st().markHard && e && e.local && rank(e.lvl) >= thr) cls += ' hard';
      if (st().markSaved && S.cards[cardKey(lang, headword(e, tk.w))]) cls += ' saved';
    }
    return `<span class="${cls}" data-w="${esc(tk.w)}">${esc(tk.w)}</span>`;
  }).join('');
  return `<span class="sent" data-si="${si}" data-text="${esc(text)}">${words} <span class="tr">${esc(trOf(s))}</span></span>`;
}
function textBlock(item, sentences, ctx, extraCls = '') {
  // sentences: array of [o,en,th] or array-of-paragraphs
  const cls = 'rt ' + (st().readFont === 'sans' ? 'sans ' : '') + (st().showTrDefault ? 'showtr ' : '') + extraCls;
  let si = 0;
  const paras = Array.isArray(sentences[0]) && Array.isArray(sentences[0][0]) ? sentences : [sentences];
  const body = paras.map(p => {
    if (typeof p === 'string') return `<p class="scene">${esc(p)}</p>`;
    return `<p>${p.map(s => sentenceHTML(s, item, ctx + '-' + (si++))).join(' ')}</p>`;
  }).join('');
  return `<div class="${cls}" data-ctx="${ctx}">${body}</div>`;
}

/* ================= word sheet ================= */
let sheetState = null;
function openWord(el) {
  const block = el.closest('[data-ctx]'); if (!block) return;
  const item = CTX.get(block.dataset.ctx); if (!item) return;
  const sentEl = el.closest('.sent');
  $$('.w.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel');
  const raw = el.dataset.w; const e = lookup(item.lang, raw, item.v);
  const sentence = { o: sentEl.dataset.text, t: $('.tr', sentEl).textContent, arr: findArr(item, sentEl.dataset.text) };
  sheetState = { item, raw, e, sentence, sentEl };
  addHistory(item.lang, headword(e, raw));
  renderSheet();
}
function findArr(item, text) {
  return allSentences(item).find(s => sentText(s) === text) || [text, '', ''];
}
function renderSheet(online) {
  const { item, raw, e, sentence } = sheetState;
  const lang = item.lang, hw = headword(e, raw);
  const saved = !!S.cards[cardKey(lang, hw)];
  const prim = st().trLang;
  const mean1 = e ? (prim === 'th' ? e.th : e.en) : '', mean2 = e ? (prim === 'th' ? e.en : e.th) : '';
  const re = new RegExp('(^|[^\\p{L}])(' + raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![\\p{L}])', 'u');
  const oHTML = esc(sentence.o).replace(re, '$1<mark>$2</mark>');
  const otherTr = trOf(sentence.arr, prim === 'th' ? 'en' : 'th');
  const low = sentence.o.toLowerCase().replace(/’/g, "'"), rl = raw.toLowerCase();
  const phrases = Object.keys(item.v || {}).filter(k => k.includes(' ') && low.includes(k.toLowerCase()) && k.toLowerCase().split(/[\s'-]+/).includes(rl));
  const phraseHTML = phrases.map(k => { const pe = parseEntry(item.v[k]); const sv = !!S.cards[cardKey(item.lang, pe.lemma || k)];
    return `<div class="sh-phrase"><span class="badge">สำนวน</span> <b>${esc(k)}</b>${pe.lvl ? ` <span class="badge lvl">${pe.lvl}</span>` : ''}<div>${esc(prim === 'th' ? pe.th : pe.en)} <span class="muted">· ${esc(prim === 'th' ? pe.en : pe.th)}</span></div>
      <button class="tbtn" data-act="savephrase" data-p="${esc(k)}" style="margin-top:6px">${ic(sv ? 'check' : 'save')}${sv ? 'บันทึกแล้ว' : 'บันทึกสำนวน'}</button></div>`; }).join('');
  $('#sheet .sheet-in').innerHTML = `
    <div class="grip"></div>
    <div class="sh-word"><h2>${esc(raw)}</h2>
      <button class="iconbtn" data-act="say" data-say="${esc(raw)}" aria-label="ฟังเสียงคำ">${ic('speaker')}</button>
      ${e && e.lvl ? `<span class="badge lvl">${e.lvl}</span>` : ''}${e && e.pos ? `<span class="badge">${POS[e.pos] || esc(e.pos)}</span>` : ''}
      <span style="flex:1"></span><button class="iconbtn" data-act="closesheet" aria-label="ปิด">${ic('x')}</button></div>
    ${e && hw !== raw.toLowerCase() ? `<div class="muted">รูปพื้นฐาน: <b>${esc(hw)}</b></div>` : ''}
    ${e ? `<p class="sh-mean">${esc(mean1 || mean2)}</p>${mean2 && mean1 ? `<p class="sh-mean2">${esc(mean2)}</p>` : ''}`
      : `<p class="sh-mean2">ยังไม่มีคำนี้ในพจนานุกรมออฟไลน์ ${navigator.onLine && st().online && !phrases.length ? '— กำลังค้นออนไลน์…' : '— ดูสำนวน/คำแปลทั้งประโยคด้านล่าง'}</p>`}
    ${phraseHTML}
    <div class="online" id="onlineBox" ${online || (!e && !phrases.length && navigator.onLine && st().online) ? '' : 'hidden'}></div>
    <div class="sh-sent"><div class="o">${oHTML}</div>
      <div class="t" id="shTr" ${sentence.t ? '' : 'hidden'}>${esc(sentence.t)}${otherTr ? `<div style="margin-top:4px;font-size:13px">${esc(otherTr)}</div>` : ''}</div>
      <div class="tools" style="margin-top:10px">
        <button class="tbtn" data-act="saysent">${ic('speaker')}ฟังประโยค</button>
        <button class="tbtn" data-act="togglesent">${ic('tr')}แปลทั้งประโยคในบทความ</button>
        ${!sentence.t ? `<button class="tbtn" data-act="mtsent">${ic('globe')}แปลออนไลน์</button>` : ''}
      </div></div>
    <div class="sh-actions">
      <button class="tbtn ${saved ? '' : 'primary'}" data-act="savecard">${ic(saved ? 'check' : 'save')}${saved ? 'อยู่ในการ์ดแล้ว' : 'บันทึกเป็นแฟลชการ์ด'}</button>
      <button class="tbtn" data-act="todict" data-q="${esc(hw)}">${ic('dict')}เปิดในพจนานุกรม</button>
      <button class="tbtn ghost" data-act="online">${ic('globe')}ค้นออนไลน์</button>
    </div>`;
  $('#sheet').classList.add('on'); $('#scrim').classList.add('on');
  if (!e && !phrases.length && navigator.onLine && st().online) runOnline();
}
function closeSheet() { $('#sheet').classList.remove('on'); $('#scrim').classList.remove('on'); $$('.w.sel').forEach(x => x.classList.remove('sel')); }

async function onlineLookup(lang, word) {
  const res = { defs: [], th: '', en: '' };
  const tasks = [
    fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word.toLowerCase())}`).then(r => r.ok ? r.json() : null).then(j => {
      (j && j[lang] || []).slice(0, 3).forEach(p => res.defs.push({ pos: p.partOfSpeech, d: (p.definitions || []).slice(0, 3).map(d => d.definition.replace(/<[^>]+>/g, '')).filter(Boolean) }));
    }).catch(() => { }),
    fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${lang}|th`).then(r => r.json()).then(j => { res.th = j && j.responseData && j.responseData.translatedText || ''; }).catch(() => { }),
    fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${lang}|en`).then(r => r.json()).then(j => { res.en = j && j.responseData && j.responseData.translatedText || ''; }).catch(() => { })
  ];
  await Promise.all(tasks);
  return res;
}
async function machineTranslate(text, from, to) {
  try { const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 480))}&langpair=${from}|${to}`); const j = await r.json(); return j.responseData.translatedText || ''; } catch (e) { return ''; }
}
function onlineHTML(r) {
  if (!r || (!r.defs.length && !r.th && !r.en)) return '<span class="muted">ค้นออนไลน์ไม่สำเร็จ (ไม่มีอินเทอร์เน็ต หรือไม่พบคำนี้)</span>';
  return `<div class="eyebrow">ผลจากออนไลน์ (Wiktionary · MyMemory)</div>
    ${r.th ? `<div><b>${esc(r.th)}</b>${r.en ? ` <span class="muted">· ${esc(r.en)}</span>` : ''}</div>` : ''}
    ${r.defs.map(d => `<div style="margin-top:6px"><i>${esc(d.pos)}</i><ol>${d.d.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>`).join('')}`;
}
async function runOnline() {
  const box = $('#onlineBox'); if (!box) return; box.hidden = false;
  if (!navigator.onLine) { box.innerHTML = '<span class="muted">ตอนนี้ออฟไลน์อยู่ ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อค้นออนไลน์</span>'; return; }
  box.innerHTML = '<span class="muted">กำลังค้นออนไลน์…</span>';
  const { item, raw } = sheetState;
  const r = await onlineLookup(item.lang, raw);
  sheetState.onlineRes = r;
  if ($('#onlineBox')) $('#onlineBox').innerHTML = onlineHTML(r);
}

/* ================= flashcards ================= */
function addCard(lang, e, raw, sentenceArr, item, auto) {
  const hw = headword(e, raw), k = cardKey(lang, hw);
  if (S.cards[k]) return false;
  const on = sheetState && sheetState.onlineRes;
  S.cards[k] = {
    k, lang, word: hw, form: raw, lvl: e ? e.lvl : '', pos: e ? e.pos : '',
    th: e ? e.th : (on && on.th) || '', en: e ? e.en : (on && on.en) || '',
    ex: sentenceArr ? sentText(sentenceArr) : '', exT: sentenceArr ? (sentenceArr[2] || '') : '', exE: sentenceArr ? (sentenceArr[1] || '') : '',
    src: item ? titleOf(item) : '', added: Date.now(), due: Date.now(), int: 0, ease: 2.5, reps: 0, lapses: 0, auto: !!auto
  };
  save(); return true;
}
function titleOf(item) {
  if (item.title) return sentText(item.title);
  if (item.kind === 'feed') return 'โพสต์ของ ' + item.user;
  return item.id;
}
function autoSaveHard(item) {
  if (!st().autoSave) return [];
  const thr = hardThreshold(item); const got = [];
  const sents = allSentences(item);
  for (const w in (item.v || {})) {
    const e = { w, ...parseEntry(item.v[w]) };
    if (rank(e.lvl) < thr) continue;
    const re = new RegExp('(^|[^\\p{L}])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}])', 'iu');
    const ex = sents.find(s => re.test(sentText(s)));
    if (addCard(item.lang, e, w, ex, item, true)) got.push(headword(e, w));
  }
  return got;
}
function finishItem(item, silent) {
  const first = !S.read[item.id];
  S.read[item.id] = Date.now();
  const got = autoSaveHard(item);
  save(); updateBadge();
  if (!silent && got.length) toast(`บันทึกคำยาก ${got.length} คำ: ${got.slice(0, 4).join(', ')}${got.length > 4 ? '…' : ''}`);
  else if (!silent && first && item.kind !== 'feed') toast('บันทึกว่าอ่านจบแล้ว');
  return got;
}
function dueCards(lang) { const now = Date.now(); return Object.values(S.cards).filter(c => (!lang || c.lang === lang) && c.due <= now); }
function grade(c, q) {
  const now = Date.now();
  if (q === 0) { c.reps = 0; c.lapses++; c.int = 0; c.ease = Math.max(1.3, c.ease - 0.2); c.due = now + 10 * 60e3; }
  else {
    c.reps++;
    if (c.reps === 1) c.int = q === 1 ? 1 : q === 2 ? 1 : 3;
    else if (c.reps === 2) c.int = q === 1 ? 3 : q === 2 ? 6 : 8;
    else c.int = Math.max(1, Math.round(c.int * (q === 1 ? 1.2 : q === 2 ? c.ease : c.ease * 1.3)));
    c.ease = Math.max(1.3, c.ease + (q === 1 ? -0.15 : q === 3 ? 0.15 : 0));
    c.due = now + c.int * 864e5 - 3600e3;
  }
  save();
}
const fmtInt = d => d < 1 ? '10 นาที' : d === 1 ? '1 วัน' : d < 30 ? d + ' วัน' : Math.round(d / 30) + ' เดือน';
function previewInt(c, q) { const x = { ...c }; const now = Date.now(); grade.call(null, x, q); /* x mutated */ return q === 0 ? '10 นาที' : fmtInt(x.int); }

/* ================= misc ================= */
function addHistory(lang, w) { S.history = [{ lang, w, t: Date.now() }, ...S.history.filter(h => !(h.lang === lang && h.w === w))].slice(0, 40); save(); }
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2800); }
function avatar(name) { let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const ini = name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase(); return `<span class="av" style="background:${AV_COLORS[h % AV_COLORS.length]}">${esc(ini)}</span>`; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function wordCount(item) { return allSentences(item).reduce((n, s) => n + tokenize(sentText(s)).filter(t => t.w).length, 0); }
function applyLook() {
  const r = document.documentElement, s = st();
  r.dataset.lang = s.lang;
  if (s.theme === 'sepia') { r.dataset.skin = 'sepia'; r.dataset.theme = 'light'; }
  else { delete r.dataset.skin; if (s.theme === 'auto') delete r.dataset.theme; else r.dataset.theme = s.theme; }
  if (s.accent === 'lang') delete r.dataset.accent; else r.dataset.accent = s.accent;
  r.style.setProperty('--read-size', s.fontSize + 'px');
  r.style.setProperty('--read-lh', s.lineHeight);
  $$('.langs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === s.lang));
}
function updateBadge() { const n = dueCards(st().lang).length; const d = $('#dueDot'); if (d) { d.hidden = !n; d.textContent = n > 99 ? '99+' : n; } }

/* ================= VIEWS ================= */
let view = { name: 'feed', id: null };
let feedObserver = null, endObserver = null;
function go(name, id) {
  stopSpeak(); closeSheet();
  view = { name, id: id || null };
  if (['feed', 'read', 'novel', 'cards', 'dict'].includes(name)) { S.tab = name; save(); }
  render(); window.scrollTo(0, 0);
}
function render() {
  const m = $('#main');
  CTX.clear();
  if (feedObserver) { feedObserver.disconnect(); feedObserver = null; }
  if (endObserver) { endObserver.disconnect(); endObserver = null; }
  const tabName = view.name === 'article' ? 'read' : view.name === 'story' ? 'novel' : view.name === 'live' ? 'read' : view.name;
  $$('.tabs button').forEach(b => b.toggleAttribute('aria-current', false) || (b.dataset.tab === tabName && b.setAttribute('aria-current', 'page')));
  const R = { feed: vFeed, read: vRead, article: vArticle, novel: vNovel, story: vStory, cards: vCards, review: vReview, dict: vDict, prefs: vPrefs, live: vLive }[view.name] || vFeed;
  R(m);
  updateBadge();
}

/* ---------- 3.1 FEED ---------- */
let feedQueue = [], feedPtr = 0, feedRound = 0;
function feedPool() {
  const s = st();
  return DB[s.lang].feed.filter(p => (!s.feedCats.length || s.feedCats.includes(p.cat)) && (!s.feedLvls.length || s.feedLvls.includes(p.lvl)));
}
function vFeed(m) {
  const s = st(), lang = s.lang;
  const cats = [...new Set(DB[lang].feed.map(p => p.cat))];
  m.innerHTML = `
    <div class="view-head"><div><div class="eyebrow">โหมดอ่านเพลิน · ${LANGS[lang].name}</div><h1>ฟีด</h1><p>โพสต์สั้นพร้อมคอมเมนต์ เลื่อนอ่านต่อได้เรื่อยๆ แตะคำเพื่อดูความหมาย</p></div></div>
    <div class="filters">
      <div class="chiprow" role="group" aria-label="หมวดหมู่">
        <button class="chip" data-act="fcat" data-v="" aria-pressed="${!s.feedCats.length}">ทุกหมวด</button>
        ${cats.map(c => `<button class="chip" data-act="fcat" data-v="${c}" aria-pressed="${s.feedCats.includes(c)}">${FEED_CATS[c] || c}</button>`).join('')}
      </div>
      <div class="chiprow" role="group" aria-label="ระดับ CEFR">
        <button class="chip lv" data-act="flvl" data-v="" aria-pressed="${!s.feedLvls.length}">ทุกระดับ</button>
        ${LEVELS.map(l => `<button class="chip lv" data-act="flvl" data-v="${l}" aria-pressed="${s.feedLvls.includes(l)}">${l}</button>`).join('')}
      </div>
    </div>
    <div id="feedList"></div><div id="feedSentinel" style="height:40px"></div>`;
  const pool = feedPool();
  if (!pool.length) { $('#feedList').innerHTML = `<div class="empty">ยังไม่มีโพสต์ในหมวด/ระดับที่เลือก ลองเลือกเพิ่ม</div>`; return; }
  // unread first, then read ones
  feedQueue = [...shuffle(pool.filter(p => !S.read[p.id])), ...shuffle(pool.filter(p => S.read[p.id]))];
  feedPtr = 0; feedRound = 0;
  endObserver = new IntersectionObserver(ents => ents.forEach(en => {
    if (en.isIntersecting) { const it = BYID[en.target.dataset.id]; if (it && !en.target.dataset.done) { en.target.dataset.done = 1; finishItem(it); const mk = en.target.closest('.post').querySelector('.readmark'); if (mk) mk.hidden = false; } }
  }), { threshold: 1 });
  feedObserver = new IntersectionObserver(ents => { if (ents.some(e => e.isIntersecting)) moreFeed(); }, { rootMargin: '600px' });
  moreFeed();
  feedObserver.observe($('#feedSentinel'));
}
function moreFeed() {
  const list = $('#feedList'); if (!list) return;
  let html = '';
  for (let i = 0; i < 4; i++) {
    if (feedPtr >= feedQueue.length) {
      feedRound++; feedPtr = 0; feedQueue = shuffle(feedPool());
      html += `<div class="feed-end">อ่านครบทุกโพสต์ในตัวกรองนี้แล้ว · วนรอบที่ ${feedRound + 1}</div>`;
    }
    html += postHTML(feedQueue[feedPtr++]);
  }
  list.insertAdjacentHTML('beforeend', html);
  $$('.post-end:not([data-obs])', list).forEach(el => { el.dataset.obs = 1; endObserver.observe(el); });
}
function postHTML(p) {
  const ctx = makeCtx(p); const liked = S.likes[p.id];
  const cctxs = (p.c || []).map(c => makeCtx({ ...p, s: c.s, c: [] }));
  return `<article class="post" data-ctxroot="${ctx}">
    <div class="post-h">${avatar(p.user)}<div class="who"><b>${esc(p.user)}</b><span>@${esc(p.handle)} · ${esc(p.time || '')} · ${FEED_CATS[p.cat] || ''}</span></div>
      <span class="badge lvl">${p.lvl}</span></div>
    ${textBlock(p, p.s, ctx)}
    <div class="post-end" data-id="${p.id}"></div>
    <div class="post-f">
      <button class="tbtn ${liked ? 'liked' : ''}" data-act="like" data-id="${p.id}">${ic('heart')}${(p.likes || 0) + (liked ? 1 : 0)}</button>
      <button class="tbtn" data-act="cmts" aria-pressed="true">${ic('chat')}${(p.c || []).length}</button>
      <button class="tbtn" data-act="trpost" aria-pressed="${st().showTrDefault}">${ic('tr')}แปล</button>
      <button class="tbtn" data-act="readall">${ic('play')}ฟัง</button>
      <span style="flex:1"></span><span class="readmark" ${S.read[p.id] ? '' : 'hidden'}>${ic('check')}อ่านแล้ว</span>
    </div>
    <div class="comments">${(p.c || []).map((c, i) => `<div class="cmt">${avatar(c.u)}<div class="cmt-b"><b>${esc(c.u)}</b>${textBlock({ ...p, s: c.s, c: [] }, c.s, cctxs[i])}</div></div>`).join('')}</div>
  </article>`;
}

/* ---------- 3.2 READ & QUIZ ---------- */
function vRead(m) {
  const s = st(), lang = s.lang;
  const all = DB[lang].read;
  const cats = [...new Set(all.map(a => a.cat))];
  const list = all.filter(a => (!s.readLvls.length || s.readLvls.includes(a.lvl)) && (!s.readCat || a.cat === s.readCat)).sort((a, b) => rank(a.lvl) - rank(b.lvl));
  m.innerHTML = `
    <div class="view-head"><div><div class="eyebrow">โหมดอ่านจับใจความ · ${LANGS[lang].name}</div><h1>บทความความรู้</h1><p>อ่านบทความจริงจัง แล้วตอบคำถามแบบข้อสอบ</p></div></div>
    <div class="filters">
      <div class="chiprow"><button class="chip" data-act="rcat" data-v="" aria-pressed="${!s.readCat}">ทุกหมวด</button>${cats.map(c => `<button class="chip" data-act="rcat" data-v="${c}" aria-pressed="${s.readCat === c}">${READ_CATS[c] || c}</button>`).join('')}</div>
      <div class="chiprow"><button class="chip lv" data-act="rlvl" data-v="" aria-pressed="${!s.readLvls.length}">ทุกระดับ</button>${LEVELS.map(l => `<button class="chip lv" data-act="rlvl" data-v="${l}" aria-pressed="${s.readLvls.includes(l)}">${l}</button>`).join('')}</div>
    </div>
    <div class="list">
      <button class="card live" data-act="live"><div class="meta"><span class="badge">${ic('globe')}ข่าว</span><span class="badge">ออนไลน์ + บันทึกออฟไลน์</span></div>
        <h3>อ่านข่าวและบทความจริง</h3><div class="sub">ข่าวจาก Wikinews · เรื่องที่กำลังเป็นกระแสใน Wikipedia · หรือวางข่าวจากเว็บใดก็ได้ ได้ระดับ คำยาก และแบบทดสอบอัตโนมัติ${Object.values(S.web || {}).filter(x => x.lang === lang).length ? ` · บันทึกไว้ ${Object.values(S.web).filter(x => x.lang === lang).length} เรื่อง` : ''}</div></button>
      ${list.map(a => {
        const q = S.quiz[a.id];
        return `<button class="card" data-act="open" data-id="${a.id}">
          <div class="meta"><span class="badge lvl">${a.lvl}</span><span class="badge">${READ_CATS[a.cat] || a.cat}</span><span class="badge">~${Math.max(1, Math.round(wordCount(a) / 130))} นาที</span>${q ? `<span class="badge good">${q.score}/${q.total}</span>` : ''}</div>
          <h3>${esc(sentText(a.title))}</h3><div class="sub">${esc(trOf(a.title))}</div></button>`;
      }).join('') || '<div class="empty">ไม่มีบทความในตัวกรองนี้</div>'}

    </div>`;
}
function vArticle(m) {
  const a = BYID[view.id]; if (!a) return go('read');
  const ctx = makeCtx(a), tctx = makeCtx(a);
  const orders = a.q.map((q, qi) => { let h = qi + 7; for (const ch of a.id) h = (h * 33 + ch.charCodeAt(0)) >>> 0; const o = q.o.map((_, i) => i); for (let i = o.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [o[i], o[j]] = [o[j], o[i]]; } return o; });
  const web = a.kind === 'web';
  m.innerHTML = `<div class="article">
    <button class="back" data-act="go" data-v="${web ? 'live' : 'read'}">${ic('back')}${web ? 'ข่าวและบทความออนไลน์' : 'บทความทั้งหมด'}</button>
    <div class="art-head"><div class="meta"><span class="badge lvl">${web ? '~' : ''}${a.lvl}</span>${web ? '' : `<span class="badge">${READ_CATS[a.cat] || a.cat}</span>`}${a.src ? `<span class="badge">${esc(a.src)}</span>` : ''}${web ? `<span class="badge">${wordCount(a)} คำ</span>` : ''}</div>
      ${textBlock(a, [a.title], tctx, 'titleblock')}</div>
    <div class="stickytools tools">
      <button class="tbtn" data-act="readall">${ic('play')}ฟังทั้งเรื่อง</button>
      <button class="tbtn" data-act="trall" aria-pressed="${st().showTrDefault}">${ic('tr')}แปลทุกประโยค</button>
      <button class="tbtn" data-act="trlang">${st().trLang === 'th' ? 'TH → EN' : 'EN → TH'}</button>
      ${web && a.url ? `<a class="tbtn" href="${esc(a.url)}" target="_blank" rel="noopener">${ic('globe')}ต้นฉบับ</a>` : ''}
    </div>
    ${web ? `<p class="muted" style="font-size:12.5px;margin:0 0 10px">ระดับประเมินอัตโนมัติจากความยาวประโยคและคำศัพท์ · กด “แปลทุกประโยค” เพื่อแปลออนไลน์ แล้วคำแปลจะเก็บไว้อ่านออฟไลน์</p>` : ''}
    <div id="artBody">${textBlock(a, a.p, ctx)}</div>
    <section class="quiz" id="quiz">
      <div><div class="eyebrow">${web ? 'แบบทดสอบอัตโนมัติ' : 'แบบทดสอบความเข้าใจ'}</div><h2 style="font-size:22px;margin-top:4px">${a.q.length ? `${a.q.length} ข้อ · ตอบแล้วดูเฉลยทันที` : 'บทความนี้มีศัพท์ในคลังน้อยเกินไป จึงสร้างแบบทดสอบไม่ได้'}</h2></div>
      ${!a.q.length ? `<div class="tools"><button class="tbtn primary" data-act="finishweb">${ic('check')}อ่านจบแล้ว · บันทึกคำยาก</button></div>` : ''}
      ${a.q.map((q, qi) => `<div class="q" data-qi="${qi}">
        <div class="qtype">ข้อ ${qi + 1} · ${QTYPES[q.t] || ''}</div>
        <div class="qt">${esc(q.q[0])}</div><div class="qth">${esc(q.q[1] || '')}</div>
        ${orders[qi].map((oi, di) => `<button class="opt" data-act="ans" data-qi="${qi}" data-oi="${di}"><span class="k">${'ABCD'[di]}</span><span>${esc(q.o[oi])}</span></button>`).join('')}
        <div class="expl" hidden></div></div>`).join('')}
      <div class="endbox" id="quizEnd" hidden></div>
    </section></div>`;
  $('.titleblock').style.cssText = 'font-size:27px;font-weight:600;line-height:1.3;margin:8px 0 2px';
  quizState = { a, answers: [], orders };
}
let quizState = null;
function answer(qi, oi) {
  const { a } = quizState; if (quizState.answers[qi] !== undefined) return;
  const q = a.q[qi]; const ord = quizState.orders[qi]; const di = oi; oi = ord[di]; quizState.answers[qi] = oi;
  const box = $(`.q[data-qi="${qi}"]`); const right = ord.indexOf(q.a);
  $$('.opt', box).forEach((b, i) => { b.disabled = true; if (i === right) b.classList.add('ok'); else if (i === di) b.classList.add('no'); });
  const ex = $('.expl', box); ex.hidden = false;
  // explanations were written against the original A–D order; remap the letters to the shuffled order
  const expl = q.raw ? (q.x || '') : (q.x || '').replace(/(^|[^A-Za-z\u00C0-\u024F])([A-D])(?![A-Za-z\u00C0-\u024F])/g, (m0, pre, L) => pre + 'ABCD'[ord.indexOf('ABCD'.indexOf(L))]);
  ex.innerHTML = `<b style="color:var(${oi === q.a ? '--good' : '--bad'})">${oi === q.a ? 'ถูกต้อง' : 'ยังไม่ถูก — คำตอบคือ ' + 'ABCD'[right]}</b><br>${esc(expl)}`;
  if (quizState.answers.filter(x => x !== undefined).length === a.q.length) {
    const score = a.q.reduce((n, q, i) => n + (quizState.answers[i] === q.a ? 1 : 0), 0);
    const prev = S.quiz[a.id];
    S.quiz[a.id] = { score: Math.max(score, prev ? prev.score : 0), total: a.q.length, last: score, t: Date.now() };
    const got = finishItem(a, true);
    const end = $('#quizEnd'); end.hidden = false;
    end.innerHTML = `<div class="eyebrow">ผลคะแนน</div><div class="score">${score} / ${a.q.length}</div>
      <p class="muted">${score === a.q.length ? 'เยี่ยมมาก เข้าใจบทความครบถ้วน' : score >= a.q.length * .6 ? 'ดีมาก ลองย้อนอ่านข้อที่พลาดอีกครั้ง' : 'ลองเปิดคำแปลทุกประโยคแล้วอ่านทวนอีกรอบ'}</p>
      ${got.length ? `<p>บันทึกคำยากลงแฟลชการ์ดแล้ว ${got.length} คำ: <b>${got.map(esc).join(', ')}</b></p>` : '<p class="muted">คำยากในบทความนี้อยู่ในแฟลชการ์ดแล้ว</p>'}
      <div class="tools"><button class="tbtn primary" data-act="go" data-v="cards">${ic('cards')}ไปทบทวนคำศัพท์</button><button class="tbtn" data-act="next-art">บทความถัดไป</button><button class="tbtn" data-act="open" data-id="${a.id}">${ic('refresh')}ทำใหม่</button></div>`;
    end.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* ---------- online news & own articles ---------- */
const FRAMED = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
const PAGES_URL = 'https://6934468323-hash.github.io/Triada/';
const WIKINEWS = { fr: { host: 'fr.wikinews.org', cat: 'Catégorie:Publié' }, es: { host: 'es.wikinews.org', cat: 'Categoría:Publicado' }, nl: { host: 'nl.wikinews.org', cat: 'Categorie:Gepubliceerd' } };
const WEB_MAX = 40;
let liveTab = 'news';
const liveCache = {};
function hashStr(s) { let h = 5381; for (const c of s) h = (h * 33 + c.charCodeAt(0)) >>> 0; return h.toString(36); }
async function getJSON(url) { const r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
const stripHTML = h => { const d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent.replace(/\s+/g, ' ').trim(); };

async function wikinewsList(lang) {
  const w = WIKINEWS[lang]; const base = `https://${w.host}/w/api.php?format=json&origin=*&`;
  let l = [];
  try {
    const j = await getJSON(base + `action=query&list=categorymembers&cmtitle=${encodeURIComponent(w.cat)}&cmsort=timestamp&cmdir=desc&cmlimit=20&cmnamespace=0&cmprop=title|timestamp`);
    l = (j.query && j.query.categorymembers) || [];
  } catch (e) { }
  if (!l.length) { const j = await getJSON(base + 'action=query&list=recentchanges&rctype=new&rcnamespace=0&rclimit=20&rcprop=title|timestamp'); l = (j.query && j.query.recentchanges) || []; }
  return l.map(x => ({ title: x.title, date: x.timestamp, host: w.host, src: 'Wikinews' }));
}
async function wikipediaTrending(lang) {
  const out = [];
  for (const back of [1, 2]) {
    const d = new Date(Date.now() - back * 864e5);
    const path = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}`;
    try {
      const j = await getJSON(`https://${lang}.wikipedia.org/api/rest_v1/feed/featured/${path}`);
      (j.news || []).forEach(n => { const l = (n.links || [])[0]; if (l) out.push({ title: (l.titles && l.titles.normalized) || l.title, sub: stripHTML(n.story), host: `${lang}.wikipedia.org`, src: 'Wikipedia · ข่าว', hot: true }); });
      ((j.mostread && j.mostread.articles) || []).filter(a => !a.namespace || a.namespace.id === 0).slice(0, 25)
        .forEach(a => out.push({ title: (a.titles && a.titles.normalized) || a.title, sub: a.extract || a.description || '', views: a.views, host: `${lang}.wikipedia.org`, src: 'Wikipedia · ยอดนิยม' }));
      if (out.length) break;
    } catch (e) { if (back === 2) throw e; }
  }
  return out;
}
async function wikiText(host, title) {
  const j = await getJSON(`https://${host}/w/api.php?format=json&origin=*&action=parse&prop=text&disableeditsection=1&redirects=1&page=${encodeURIComponent(title)}`);
  const html = (j.parse && j.parse.text && j.parse.text['*']) || '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  $$('table,style,script,figure,.infobox,.thumb,.reference,.mw-references-wrap,sup,.noprint,.metadata,.hatnote,.bandeau-container,.mw-empty-elt,ul,ol,dl', doc).forEach(x => x.remove());
  return $$('p', doc).map(p => p.textContent.replace(/\[[^\]]{1,40}\]/g, '').replace(/\s+/g, ' ').trim()).filter(t => t.length > 60 && /\p{L}{3}/u.test(t)).slice(0, 10);
}

/* sentence splitting that survives abbreviations and decimals */
const ABBR = /(?:^|\s)(?:[A-ZÀ-Þ]|M|MM|Mme|Mlle|Dr|Pr|St|Ste|Sr|Sra|Sres|Dña|Ud|Uds|av|etc|ca|bijv|o\.a|nr|resp|dhr|mevr|blz|J\.-C|p|pp|vol|n|núm|art)\.$/;
function splitSentences(t) {
  const parts = t.replace(/\s+/g, ' ').trim().split(/(?<=[.!?…]["»”’)]?)\s+(?=[«"“‘(¿¡]?[\p{Lu}0-9])/u);
  const out = [];
  for (const p of parts) { if (out.length && ABBR.test(out[out.length - 1])) out[out.length - 1] += ' ' + p; else out.push(p); }
  return out.map(x => x.trim()).filter(x => /\p{L}/u.test(x));
}

function autoVocab(item) {
  const v = {};
  for (const s of allSentences(item)) for (const tk of tokenize(sentText(s))) {
    if (!tk.w || v[tk.w]) continue;
    const e = lookup(item.lang, tk.w);
    if (e && rank(e.lvl) >= rank('B1')) v[tk.w] = [e.lvl, e.pos, e.en, e.th, e.lemma || e.w].join('|');
  }
  return v;
}
function estimateLevel(item) {
  const sents = item.p.flat(); let n = 0, chars = 0, unk = 0;
  for (const s of sents) for (const tk of tokenize(sentText(s))) { if (!tk.w) continue; n++; chars += tk.w.length; if (!lookup(item.lang, tk.w)) unk++; }
  if (!n) return 'B1';
  const avgLen = n / Math.max(1, sents.length), avgW = chars / n, u = unk / n;
  const score = 0.12 * avgLen + 0.9 * (avgW - 4) + 1.2 * u;
  return score < 1.8 ? 'A1' : score < 2.6 ? 'A2' : score < 3.4 ? 'B1' : score < 4.2 ? 'B2' : score < 5.0 ? 'C1' : 'C2'; // calibrated on the built-in articles: 16/21 exact, rest ±1
}
const QT = {
  fill: { fr: 'Complétez la phrase avec le mot qui convient.', es: 'Completa la frase con la palabra adecuada.', nl: 'Vul het juiste woord in.' },
  mean: { fr: w => `Dans le texte, que signifie « ${w} » ?`, es: w => `En el texto, ¿qué significa «${w}»?`, nl: w => `Wat betekent ‘${w}’ in de tekst?` },
  not: { fr: 'Laquelle de ces phrases N’APPARAÎT PAS dans le texte ?', es: '¿Cuál de estas frases NO aparece en el texto?', nl: 'Welke zin staat NIET in de tekst?' }
};
const clip = (s, n = 150) => s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;
function autoQuiz(item) {
  const L = item.lang, qs = [], used = new Set();
  const sents = item.p.flat().map(sentText);
  const words = Object.keys(item.v || {}).map(w => ({ w, ...parseEntry(item.v[w]) })).sort((a, b) => rank(b.lvl) - rank(a.lvl));
  const pool = [...DICT[L].values()].filter(e => e.th && e.pos);
  const distract = (e, key) => shuffle(pool.filter(d => d.pos === e.pos && (d.lemma || d.w) !== (e.lemma || e.w) && Math.abs(rank(d.lvl) - rank(e.lvl)) <= 1 && d[key] !== e[key])).slice(0, 3);
  // 1–3: fill in the blank
  for (const e of words) {
    if (qs.length >= 3) break;
    const hw = e.lemma || e.w; if (used.has(hw)) continue;
    const re = new RegExp('(^|[^\\p{L}])' + e.w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}])', 'u');
    const sent = sents.find(s => re.test(s) && s.length < 260); if (!sent) continue;
    const ds = distract(e, 'w'); if (ds.length < 3) continue;
    used.add(hw);
    qs.push({ t: 'vocab', raw: 1, q: [sent.replace(re, '$1_____'), QT.fill[L] + ' · เลือกคำที่เหมาะสมเติมในช่องว่าง'], o: [e.w, ...ds.map(d => d.w)], a: 0,
      x: `“${e.w}” = ${e.th}${e.en ? ' (' + e.en + ')' : ''} · ตัวเลือกอื่นแปลว่า ${ds.map(d => d.w + ' = ' + d.th).join(', ')}` });
  }
  // 4: meaning in context
  const me = words.find(e => !used.has(e.lemma || e.w));
  if (me) { const ds = distract(me, 'th'); if (ds.length >= 3) { used.add(me.lemma || me.w); const sent = sents.find(s => s.includes(me.w)) || '';
    qs.push({ t: 'vocab', raw: 1, q: [QT.mean[L](me.w), 'คำนี้ในบทความหมายถึงอะไร'], o: [me.th, ...ds.map(d => d.th)], a: 0, x: `${me.w} = ${me.th} (${me.en}) · ในประโยค: “${clip(sent, 180)}”` }); } }
  // 5: which sentence is NOT in the text
  const foreign = shuffle([...DB[L].read, ...DB[L].novel].flatMap(a => (a.p || []).filter(Array.isArray).flat().map(sentText))).find(s => s.length > 50 && s.length < 200);
  const mine = shuffle(sents.filter(s => s.length > 50 && s.length < 220)).slice(0, 3);
  if (foreign && mine.length === 3) qs.push({ t: 'not', raw: 1, q: [QT.not[L], 'ประโยคใดไม่ได้อยู่ในบทความนี้'], o: [clip(foreign), ...mine.map(s => clip(s))], a: 0, x: 'ประโยคนี้มาจากบทความอื่นในแอป ส่วนอีกสามข้อปรากฏในบทความนี้ ลองย้อนกลับไปหาดูว่าอยู่ย่อหน้าไหน' });
  return qs;
}
function buildWebItem(o) {
  const p = o.paras.map(t => splitSentences(t).map(s => [s, '', ''])).filter(x => x.length);
  const item = { id: o.id || ('web:' + hashStr(o.lang + '|' + o.title + '|' + (o.url || ''))), lang: o.lang, kind: 'web', src: o.src, url: o.url || '', cat: 'news', title: [o.title, '', ''], p, t: Date.now() };
  item.v = autoVocab(item); item.lvl = estimateLevel(item); item.q = autoQuiz(item);
  return item;
}
function storeWeb(item) {
  S.web = S.web || {}; S.web[item.id] = item; BYID[item.id] = item;
  const ids = Object.values(S.web).sort((a, b) => b.t - a.t).map(x => x.id);
  ids.slice(WEB_MAX).forEach(id => { delete S.web[id]; });
  save();
}
async function openWeb(host, title, src, btn) {
  const lang = st().lang; const id = 'web:' + hashStr(lang + '|' + title + '|https://' + host + '/wiki/' + title);
  if (S.web && S.web[id]) return go('article', id);
  if (btn) { btn.disabled = true; btn.style.opacity = .6; }
  toast('กำลังโหลดบทความ…');
  try {
    const paras = await wikiText(host, title);
    if (!paras.length) throw new Error('empty');
    const item = buildWebItem({ id, lang, title, paras, src, url: 'https://' + host + '/wiki/' + encodeURIComponent(title.replace(/ /g, '_')) });
    storeWeb(item); go('article', id);
  } catch (e) { toast('โหลดบทความนี้ไม่สำเร็จ'); if (btn) { btn.disabled = false; btn.style.opacity = 1; } }
}
function liveError() {
  return FRAMED
    ? `<div class="empty">หน้าตัวอย่างบน claude.ai ไม่อนุญาตให้ดึงข้อมูลจากเว็บอื่น<br>เปิดแอปเวอร์ชันเต็มที่ <a href="${PAGES_URL}" target="_blank" rel="noopener">${PAGES_URL}</a><br>หรือใช้แท็บ “วางบทความเอง” ได้เลย</div>`
    : `<div class="empty">โหลดไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วกดโหลดใหม่<br><button class="tbtn" data-act="liverefresh" style="margin-top:10px">${ic('refresh')}โหลดใหม่</button></div>`;
}
function vLive(m) {
  const lang = st().lang;
  const saved = Object.values(S.web || {}).filter(x => x.lang === lang).sort((a, b) => b.t - a.t);
  const tabs = [['news', 'ข่าวล่าสุด'], ['trend', 'กำลังเป็นกระแส'], ['saved', `บันทึกไว้ (${saved.length})`], ['paste', 'วางบทความเอง']];
  m.innerHTML = `<button class="back" data-act="go" data-v="read">${ic('back')}บทความทั้งหมด</button>
    <div class="view-head"><div><div class="eyebrow">ข่าวและบทความจริง · ${LANGS[lang].name}</div><h1>อ่านข่าว</h1>
      <p>เปิดแล้วเก็บไว้อ่านออฟไลน์ให้อัตโนมัติ พร้อมประเมินระดับ ศัพท์ยาก และแบบทดสอบที่สร้างให้</p></div></div>
    <div class="seg" role="tablist" style="margin-bottom:14px">${tabs.map(([k, l]) => `<button role="tab" data-act="livetab" data-v="${k}" aria-pressed="${liveTab === k}">${l}</button>`).join('')}</div>
    <div id="liveBox" class="list"></div>`;
  const box = $('#liveBox');
  if (liveTab === 'saved') {
    box.innerHTML = saved.map(it => { const q = S.quiz[it.id]; return `<div class="wordrow" style="align-items:flex-start">
      <button class="card" style="border:0;padding:0;background:none" data-act="open" data-id="${esc(it.id)}">
        <div class="meta"><span class="badge lvl">~${it.lvl}</span><span class="badge">${esc(it.src)}</span>${q ? `<span class="badge good">${q.score}/${q.total}</span>` : ''}${S.read[it.id] ? '<span class="badge good">อ่านแล้ว</span>' : ''}</div>
        <h3>${esc(sentText(it.title))}</h3><div class="sub">${new Date(it.t).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} · ${wordCount(it)} คำ</div></button>
      <button class="iconbtn" data-act="delweb" data-id="${esc(it.id)}" aria-label="ลบ">${ic('trash')}</button></div>`; }).join('')
      || '<div class="empty">ยังไม่มีบทความที่บันทึกไว้<br>เปิดข่าวจากแท็บอื่น หรือวางบทความเอง แล้วจะเก็บไว้ที่นี่ อ่านได้แม้ออฟไลน์</div>';
    return;
  }
  if (liveTab === 'paste') {
    box.innerHTML = `<div class="entry"><div class="eyebrow">สร้างบทเรียนจากข้อความของคุณ</div>
      <p class="muted" style="margin:6px 0 12px">คัดลอกข่าวหรือบทความภาษา${LANGS[lang].th}จากเว็บใดก็ได้ (เช่น ${lang === 'fr' ? 'Le Monde, France Info, RFI' : lang === 'es' ? 'El País, BBC Mundo, RTVE' : 'NOS, de Volkskrant, VRT NWS'}) มาวางที่นี่ แอปจะแบ่งประโยค ทำให้แตะคำได้ ประเมินระดับ และสร้างแบบทดสอบให้ ทำงานได้แม้ไม่มีอินเทอร์เน็ต</p>
      <label class="sr" for="pasteTitle">ชื่อเรื่อง</label><input id="pasteTitle" type="text" placeholder="ชื่อเรื่อง (ไม่บังคับ)" style="width:100%;margin-bottom:8px;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:9px 12px">
      <label class="sr" for="pasteText">เนื้อหา</label><textarea id="pasteText" placeholder="วางเนื้อหาข่าวที่นี่…" style="min-height:200px;font-family:var(--f-read);font-size:15px"></textarea>
      <div class="tools" style="margin-top:10px"><button class="tbtn primary" data-act="pastego">${ic('book')}สร้างบทเรียน</button></div></div>`;
    return;
  }
  const key = lang + ':' + liveTab;
  const paint = list => {
    if (!list.length) { box.innerHTML = '<div class="empty">ยังไม่มีรายการใหม่จากแหล่งนี้ ลองแท็บอื่นหรือวางบทความเอง</div>'; return; }
    box.innerHTML = list.map(x => `<button class="card" data-act="liveopen" data-host="${esc(x.host)}" data-title="${esc(x.title)}" data-src="${esc(x.src)}">
      <div class="meta"><span class="badge">${esc(x.src)}</span>${x.date ? `<span class="badge">${new Date(x.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>` : ''}${x.views ? `<span class="badge">${x.views.toLocaleString()} ครั้งที่อ่าน</span>` : ''}${S.web && S.web['web:' + hashStr(lang + '|' + x.title + '|https://' + x.host + '/wiki/' + x.title)] ? '<span class="badge good">บันทึกแล้ว</span>' : ''}</div>
      <h3>${esc(x.title)}</h3>${x.sub ? `<div class="sub">${esc(clip(x.sub, 160))}</div>` : ''}</button>`).join('')
      + `<p class="muted" style="font-size:12.5px">เนื้อหาจาก ${liveTab === 'news' ? 'Wikinews (CC BY 2.5)' : 'Wikipedia (CC BY-SA 4.0)'} · ข่าวใน Wikinews อาจไม่ได้อัปเดตทุกวัน ถ้าอยากอ่านข่าววันนี้ ให้ใช้แท็บ “วางบทความเอง”</p>`;
  };
  if (liveCache[key]) { paint(liveCache[key]); return; }
  if (!navigator.onLine) { box.innerHTML = `<div class="empty">ตอนนี้ออฟไลน์อยู่ ดูบทความที่บันทึกไว้ หรือวางบทความเองได้</div>`; return; }
  box.innerHTML = '<div class="empty">กำลังโหลด…</div>';
  (liveTab === 'news' ? wikinewsList(lang) : wikipediaTrending(lang))
    .then(list => { liveCache[key] = list; if (view.name === 'live' && liveTab + st().lang === key.split(':')[1] + lang) paint(list); })
    .catch(() => { if ($('#liveBox')) $('#liveBox').innerHTML = liveError(); });
}
async function mtAll(btn, item) {
  if (!navigator.onLine || FRAMED) { toast(FRAMED ? 'หน้าตัวอย่างบน claude.ai แปลออนไลน์ไม่ได้' : 'ต้องใช้อินเทอร์เน็ตเพื่อแปลประโยคที่ยังไม่มีคำแปล'); return false; }
  const want = st().trLang, idx = want === 'en' ? 1 : 2;
  const sents = allSentences(item).filter(s => !s[idx]);
  btn.disabled = true; let done = 0, fail = 0;
  for (const s of sents) {
    btn.innerHTML = `กำลังแปล ${++done}/${sents.length}…`;
    const r = await machineTranslate(s[0], item.lang, want);
    if (r && !/MYMEMORY WARNING|QUERY LENGTH/i.test(r)) s[idx] = r; else fail++;
    $$(`#main .sent`).filter(el => el.dataset.text === s[0]).forEach(el => { $('.tr', el).textContent = s[idx] || ''; });
  }
  save(); btn.disabled = false; btn.innerHTML = ic('tr') + 'แปลทุกประโยค';
  if (fail) toast(`แปลไม่สำเร็จ ${fail} ประโยค (บริการแปลฟรีอาจถึงโควตาวันนี้แล้ว)`);
  return true;
}

/* ---------- 3.3 NOVELS ---------- */
function vNovel(m) {
  const lang = st().lang;
  const list = DB[lang].novel;
  m.innerHTML = `<div class="view-head"><div><div class="eyebrow">โหมดนิยาย · ${LANGS[lang].name}</div><h1>เรื่องสั้น</h1><p>นิยายสั้นหลายแนว เขียนด้วยสำนวนวรรณกรรม</p></div></div>
    <div class="genre-grid">${list.map(n => {
      const g = GENRES[n.genre] || { th: n.genre, c: 'var(--accent)' }; const pos = S.novelPos[n.id];
      return `<button class="cover" style="--g:${g.c}" data-act="story" data-id="${n.id}"><span class="gname">${g.th}</span>
        <div class="meta"><span class="badge lvl">${n.lvl}</span><span class="badge">~${Math.max(1, Math.round(wordCount(n) / 150))} นาที</span>${S.read[n.id] ? `<span class="badge good">อ่านจบแล้ว</span>` : pos ? `<span class="badge">อ่านถึง ${pos}%</span>` : ''}</div>
        <h3>${esc(sentText(n.title))}</h3><p>${esc(n.blurb || trOf(n.title))}</p></button>`;
    }).join('')}</div>`;
}
let storyScroll = null;
function vStory(m) {
  const n = BYID[view.id]; if (!n) return go('novel');
  const g = GENRES[n.genre] || { th: n.genre, c: 'var(--accent)' };
  const ctx = makeCtx(n), tctx = makeCtx(n);
  m.innerHTML = `<div class="novel">
    <button class="back" data-act="go" data-v="novel">${ic('back')}ชั้นหนังสือ</button>
    <div class="art-head"><div class="meta"><span class="badge" style="color:${g.c}">${g.th}</span><span class="badge lvl">${n.lvl}</span></div>
      ${textBlock(n, [n.title], tctx, 'titleblock')}<div class="tsub">${esc(n.blurb || '')}</div></div>
    <div class="stickytools"><div class="tools" style="margin-bottom:8px">
      <button class="tbtn" data-act="readall">${ic('play')}ฟังทั้งเรื่อง</button>
      <button class="tbtn" data-act="trall" aria-pressed="${st().showTrDefault}">${ic('tr')}แปลทุกประโยค</button>
      <button class="tbtn" data-act="trlang">${st().trLang === 'th' ? 'TH → EN' : 'EN → TH'}</button></div>
      <div class="progress"><i id="storyProg"></i></div></div>
    <div id="artBody">${textBlock(n, n.p, ctx)}</div>
    <div class="endbox" id="storyEnd"><div class="eyebrow">จบเรื่อง</div>
      <p>คำยากจากเรื่องนี้จะถูกบันทึกลงแฟลชการ์ดเมื่ออ่านมาถึงตรงนี้</p>
      <div class="tools"><button class="tbtn primary" data-act="go" data-v="cards">${ic('cards')}ทบทวนคำศัพท์</button><button class="tbtn" data-act="go" data-v="novel">เลือกเรื่องอื่น</button></div></div></div>`;
  $('.titleblock').style.cssText = 'font-size:29px;font-style:italic;font-weight:600;line-height:1.25;margin:8px 0 4px';
  let ended = false;
  endObserver = new IntersectionObserver(ents => { if (ents[0].isIntersecting && !ended) { ended = true; const got = finishItem(n, true); S.novelPos[n.id] = 100; save(); const p = $('#storyEnd p'); if (p) p.innerHTML = got.length ? `บันทึกคำยากลงแฟลชการ์ดแล้ว ${got.length} คำ: <b>${got.map(esc).join(', ')}</b>` : 'คำยากจากเรื่องนี้อยู่ในแฟลชการ์ดของคุณแล้ว'; } }, { threshold: .6 });
  endObserver.observe($('#storyEnd'));
}
function onScroll() {
  if (view.name !== 'story') return;
  const body = $('#artBody'); if (!body) return;
  const r = body.getBoundingClientRect(); const pct = Math.min(100, Math.max(0, Math.round((innerHeight - r.top) / (r.height) * 100)));
  const bar = $('#storyProg'); if (bar) bar.style.width = pct + '%';
  const id = view.id; if (!S.read[id] && pct > (S.novelPos[id] || 0)) { S.novelPos[id] = pct; save(); }
}

/* ---------- FLASHCARDS ---------- */
let cardFilter = '';
function vCards(m) {
  const lang = st().lang;
  const all = Object.values(S.cards).filter(c => c.lang === lang);
  const due = dueCards(lang);
  const learned = all.filter(c => c.int >= 21).length;
  const q = cardFilter.toLowerCase();
  const shown = all.filter(c => !q || c.word.includes(q) || (c.th || '').includes(q) || (c.en || '').toLowerCase().includes(q)).sort((a, b) => b.added - a.added);
  m.innerHTML = `<div class="view-head"><div><div class="eyebrow">ทบทวน · ${LANGS[lang].name}</div><h1>แฟลชการ์ด</h1><p>คำยากถูกบันทึกอัตโนมัติหลังอ่านจบ และทบทวนตามระยะห่าง (Spaced Repetition)</p></div></div>
    <div class="stats"><div class="stat"><b>${due.length}</b><span>ถึงกำหนดทบทวน</span></div><div class="stat"><b>${all.length}</b><span>คำทั้งหมด</span></div><div class="stat"><b>${learned}</b><span>จำได้ดี (≥ 3 สัปดาห์)</span></div></div>
    <div class="tools" style="margin-bottom:16px">
      <button class="tbtn primary" data-act="review" ${all.length ? '' : 'disabled'}>${ic('cards')}${due.length ? `ทบทวน ${Math.min(due.length, st().sessionSize)} ใบ` : 'ฝึกเพิ่ม (สุ่ม)'}</button>
      <button class="tbtn" data-act="go" data-v="prefs">${ic('gear')}ตั้งค่าการ์ด</button></div>
    ${all.length ? `<label class="search"><span class="sr">ค้นหาคำในการ์ด</span>${ic('dict')}<input id="cardSearch" type="search" placeholder="ค้นหาคำในการ์ด" value="${esc(cardFilter)}"></label>` : ''}
    <div class="list">${shown.map(c => `<div class="wordrow"><button class="iconbtn" data-act="sayw" data-lang="${c.lang}" data-say="${esc(c.word)}" aria-label="ฟังเสียง">${ic('speaker')}</button>
      <div class="wd"><b>${esc(c.word)}</b> ${c.lvl ? `<span class="badge lvl">${c.lvl}</span>` : ''}<div>${esc(c.th || c.en)}${c.th && c.en ? ' · ' + esc(c.en) : ''}</div></div>
      <span class="badge">${c.due <= Date.now() ? 'ถึงกำหนด' : 'อีก ' + fmtInt(Math.max(1, Math.round((c.due - Date.now()) / 864e5)))}</span>
      <button class="iconbtn" data-act="delcard" data-k="${esc(c.k)}" aria-label="ลบการ์ด">${ic('trash')}</button></div>`).join('') ||
      `<div class="empty">${all.length ? 'ไม่พบคำที่ค้นหา' : 'ยังไม่มีการ์ด — อ่านโพสต์หรือบทความให้จบ ระบบจะเก็บคำยากให้อัตโนมัติ<br>หรือแตะคำแล้วกด "บันทึกเป็นแฟลชการ์ด"'}</div>`}</div>`;
  const inp = $('#cardSearch'); if (inp) inp.addEventListener('input', e => { cardFilter = e.target.value; const pos = e.target.selectionStart; vCards(m); const n = $('#cardSearch'); n.focus(); n.setSelectionRange(pos, pos); });
}
let rv = null;
function startReview() {
  const lang = st().lang; let list = shuffle(dueCards(lang));
  if (!list.length) list = shuffle(Object.values(S.cards).filter(c => c.lang === lang));
  rv = { list: list.slice(0, st().sessionSize), i: 0, flipped: false, done: 0, again: 0 };
  view = { name: 'review' }; render();
}
function vReview(m) {
  if (!rv) return go('cards');
  if (rv.i >= rv.list.length) {
    m.innerHTML = `<div class="view-head"><div><div class="eyebrow">จบรอบทบทวน</div><h1>ทบทวนครบ ${rv.done} ใบ</h1><p>${rv.again ? `ลืม ${rv.again} ใบ — ระบบจะเอามาให้ทบทวนอีกครั้งใน 10 นาที` : 'จำได้ทุกใบ ยอดเยี่ยม'}</p></div></div>
      <div class="tools"><button class="tbtn primary" data-act="go" data-v="cards">กลับหน้าการ์ด</button><button class="tbtn" data-act="go" data-v="feed">อ่านต่อ</button></div>`; return;
  }
  const c = rv.list[rv.i];
  let dir = st().cardDir; if (dir === 'mix') dir = (rv.i + c.word.length) % 2 ? 'word' : 'mean';
  const front = dir === 'word'
    ? `<div class="eyebrow">${LANGS[c.lang].name}</div><div class="big">${esc(c.word)}</div>${c.pos ? `<span class="badge">${POS[c.pos] || c.pos}</span>` : ''}`
    : `<div class="eyebrow">ภาษา${LANGS[c.lang].th}ว่าอะไร?</div><div class="mean">${esc(c.th || c.en)}</div><div class="muted">${esc(c.th ? c.en : '')}</div>`;
  const back = `<div class="big">${esc(c.word)}</div><div class="mean">${esc(c.th || '')}</div><div class="muted">${esc(c.en || '')}</div>
    ${c.ex ? `<div class="ex">“${esc(c.ex)}”<br><small>${esc(st().trLang === 'en' ? c.exE : c.exT)}</small></div>` : ''}${c.src ? `<div class="muted" style="font-size:12px">จาก: ${esc(c.src)}</div>` : ''}`;
  m.innerHTML = `<div class="view-head"><div><div class="eyebrow">ใบที่ ${rv.i + 1} / ${rv.list.length}</div><h1>ทบทวน</h1></div>
    <button class="tbtn" data-act="go" data-v="cards">${ic('x')}ออก</button></div>
    <div class="progress"><i style="width:${rv.i / rv.list.length * 100}%"></i></div>
    <div class="flash"><div class="fc ${rv.flipped ? 'flip' : ''}" data-act="flip" role="button" tabindex="0" aria-label="พลิกการ์ด">
      <div class="fc-side">${front}<span class="hint">แตะเพื่อพลิก</span></div><div class="fc-side fc-back">${back}</div></div></div>
    <div class="tools" style="justify-content:center;margin-bottom:12px"><button class="tbtn" data-act="sayw" data-lang="${c.lang}" data-say="${esc(c.word)}">${ic('speaker')}ฟังคำ</button>${c.ex ? `<button class="tbtn" data-act="sayw" data-lang="${c.lang}" data-say="${esc(c.ex)}">${ic('speaker')}ฟังประโยค</button>` : ''}</div>
    <div class="grades" ${rv.flipped ? '' : 'hidden'}>
      ${['ลืม', 'ยาก', 'จำได้', 'ง่ายมาก'].map((l, q) => `<button class="g${q}" data-act="grade" data-q="${q}">${l}<small>${previewInt(c, q)}</small></button>`).join('')}</div>
    ${rv.flipped ? '' : `<button class="tbtn primary" style="width:100%;justify-content:center;padding:12px" data-act="flip">ดูคำตอบ</button>`}`;
  if (dir === 'word' && !rv.flipped && rv.autoSaid !== rv.i) { rv.autoSaid = rv.i; }
}

/* ---------- DICTIONARY ---------- */
let dictQ = '', dictAll = false;
function dictSearch(q, lang) {
  q = q.trim().toLowerCase(); if (!q) return [];
  const langs = dictAll ? Object.keys(DICT) : [lang];
  const out = [];
  const deacc = s => s.normalize('NFD').replace(/\p{M}/gu, '');
  const qd = deacc(q);
  for (const l of langs) {
    const cands = new Set(candidates(l, q));
    for (const [k, e] of DICT[l]) {
      let sc = 0; const kd = deacc(k);
      if (k === q) sc = 100; else if (cands.has(k)) sc = 90; else if (kd === qd) sc = 85; else if (kd.startsWith(qd)) sc = 60 - Math.min(20, k.length - q.length);
      else if ((e.th || '').split(/[,،]\s*/).some(x => x.trim() === q)) sc = 70; else if ((e.th || '').includes(q)) sc = 50; else if ((' ' + (e.en || '').toLowerCase() + ' ').match(new RegExp('[^a-z]' + q.replace(/[^a-z ]/g, '') + '[^a-z]')) && /[a-z]/.test(q)) sc = 45;
      else if (q.length > 2 && kd.includes(qd)) sc = 25;
      if (sc) out.push({ l, e, sc });
    }
  }
  return out.sort((a, b) => b.sc - a.sc || a.e.w.length - b.e.w.length).slice(0, 30);
}
function examplesFor(lang, e) {
  const out = []; const word = e.w;
  const re = new RegExp('(^|[^\\p{L}])' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}])', 'iu');
  const items = (e.src && e.src.length ? e.src.map(id => BYID[id]) : [...DB[lang].feed, ...DB[lang].read, ...DB[lang].novel]).filter(Boolean);
  for (const it of items) { for (const s of allSentences(it)) { if (re.test(sentText(s))) { out.push({ s, it }); break; } } if (out.length >= 3) break; }
  return out;
}
function entryHTML(l, e, full) {
  const hw = e.lemma || e.w; const saved = !!S.cards[cardKey(l, hw)];
  const exs = full ? examplesFor(l, e) : [];
  return `<div class="entry"><div class="sh-word"><h2>${esc(e.w)}</h2><button class="iconbtn" data-act="sayw" data-lang="${l}" data-say="${esc(e.w)}" aria-label="ฟังเสียง">${ic('speaker')}</button>
    ${dictAll ? `<span class="badge">${l.toUpperCase()}</span>` : ''}${e.lvl ? `<span class="badge lvl">${e.lvl}</span>` : ''}${e.pos ? `<span class="badge">${POS[e.pos] || e.pos}</span>` : ''}</div>
    ${e.lemma && e.lemma !== e.w ? `<div class="muted">รูปพื้นฐาน: ${esc(e.lemma)}</div>` : ''}
    <p class="m">${esc(e.th)}</p><p class="m en">${esc(e.en)}</p>
    ${exs.length ? `<div class="exs">${exs.map(x => `<blockquote>${esc(sentText(x.s))}<small>${esc(trOf(x.s))} — ${esc(titleOf(x.it))}</small></blockquote>`).join('')}</div>` : ''}
    <div class="tools" style="margin-top:10px"><button class="tbtn ${saved ? '' : 'primary'}" data-act="dictsave" data-lang="${l}" data-w="${esc(e.w)}">${ic(saved ? 'check' : 'save')}${saved ? 'อยู่ในการ์ดแล้ว' : 'บันทึกเป็นการ์ด'}</button></div></div>`;
}
function vDict(m) {
  const lang = st().lang;
  m.innerHTML = `<div class="view-head"><div><div class="eyebrow">พจนานุกรมในตัว · ${DICT[lang].size.toLocaleString()} คำ (${LANGS[lang].name})</div><h1>พจนานุกรม</h1>
    <p>พิมพ์คำภาษา${LANGS[lang].th} หรือพิมพ์ไทย/อังกฤษเพื่อหาคำแปลย้อนกลับ ถ้าไม่มีในเครื่องจะค้นออนไลน์ให้</p></div></div>
    <label class="search"><span class="sr">ค้นหาคำ</span>${ic('dict')}<input id="dictInput" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="เช่น ${lang === 'fr' ? 'maison, inquiétant' : lang === 'es' ? 'casa, sin embargo' : 'huis, gezellig'} หรือ 'บ้าน'" value="${esc(dictQ)}"></label>
    <div class="tools" style="margin-bottom:12px"><button class="chip" data-act="dictall" aria-pressed="${dictAll}">ค้นทุกภาษา</button>${navigator.onLine ? '' : '<span class="offline-pill">ออฟไลน์</span>'}</div>
    <div id="dictOut" class="list"></div>`;
  const inp = $('#dictInput');
  inp.addEventListener('input', () => { dictQ = inp.value; dictResults(); });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { dictQ = inp.value; dictResults(true); } });
  dictResults();
}
async function dictResults(force) {
  const out = $('#dictOut'); if (!out) return; const lang = st().lang;
  if (!dictQ.trim()) {
    const h = S.history.filter(x => dictAll || x.lang === lang).slice(0, 16);
    out.innerHTML = h.length ? `<div class="eyebrow">ค้นหาล่าสุด</div><div class="chiprow" style="flex-wrap:wrap">${h.map(x => `<button class="chip" data-act="dictq" data-q="${esc(x.w)}">${esc(x.w)}</button>`).join('')}</div>` : '<div class="empty">พิมพ์คำที่อยากรู้ได้เลย</div>'; return;
  }
  const res = dictSearch(dictQ, lang);
  out.innerHTML = res.map((r, i) => i < 2 ? entryHTML(r.l, r.e, true) : `<button class="card" data-act="dictq" data-q="${esc(r.e.w)}" data-l="${r.l}"><div class="meta"><b style="font-family:var(--f-read);font-size:16.5px">${esc(r.e.w)}</b>${dictAll ? `<span class="badge">${r.l.toUpperCase()}</span>` : ''}${r.e.lvl ? `<span class="badge lvl">${r.e.lvl}</span>` : ''}</div><div class="sub">${esc(r.e.th)} · ${esc(r.e.en)}</div></button>`).join('');
  const exact = res.length && res[0].sc >= 85;
  if (!exact && /\p{L}/u.test(dictQ) && st().online) {
    const q = dictQ.trim();
    const box = document.createElement('div'); box.className = 'entry';
    box.innerHTML = navigator.onLine ? '<span class="muted">กำลังค้นออนไลน์…</span>' : `<span class="muted">ไม่พบ “${esc(q)}” ตรงตัวในพจนานุกรมออฟไลน์ — เชื่อมต่ออินเทอร์เน็ตเพื่อค้นออนไลน์</span>`;
    out.prepend(box);
    if (!navigator.onLine) return;
    clearTimeout(dictResults.t);
    dictResults.t = setTimeout(async () => {
      if (dictQ.trim() !== q) return;
      const isThai = /[฀-๿]/.test(q);
      let html = '';
      if (isThai) { const t = await machineTranslate(q, 'th', lang); html = t ? `<div class="eyebrow">แปลออนไลน์ (ไทย → ${LANGS[lang].name})</div><h2 style="font-family:var(--f-read)">${esc(t)}</h2>` : ''; }
      else { const r = await onlineLookup(lang, q); html = `<h2 style="font-family:var(--f-read)">${esc(q)}</h2>` + onlineHTML(r); dictOnline = { q, r }; if (r.th || r.en) html += `<div class="tools" style="margin-top:10px"><button class="tbtn primary" data-act="dictsaveonline">${ic('save')}บันทึกเป็นการ์ด</button></div>`; }
      if (dictQ.trim() === q) box.innerHTML = html || '<span class="muted">ค้นออนไลน์ไม่สำเร็จ</span>';
    }, force ? 0 : 600);
  } else if (!res.length) out.innerHTML = '<div class="empty">ไม่พบคำนี้</div>';
}
let dictOnline = null;

/* ---------- SETTINGS ---------- */
function vPrefs(m) {
  const s = st();
  const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-act="set" data-k="${key}" data-v="${v}" aria-pressed="${String(s[key]) === String(v)}">${l}</button>`).join('')}</div>`;
  const sw = (key) => `<span class="sw"><input type="checkbox" id="sw-${key}" data-act="setb" data-k="${key}" ${s[key] ? 'checked' : ''}><span></span></span>`;
  const voiceSel = l => { const vs = voicesCache.filter(v => v.lang && v.lang.toLowerCase().startsWith(l)); return vs.length ? `<select id="voice-${l}" data-act="voice" data-l="${l}">${vs.map(v => `<option value="${esc(v.voiceURI)}" ${voiceFor(l) && voiceFor(l).voiceURI === v.voiceURI ? 'selected' : ''}>${esc(v.name)}${v.localService ? ' (ออฟไลน์)' : ''}</option>`).join('')}</select>` : '<span class="muted">ไม่พบเสียงในเครื่อง</span>'; };
  const ncards = Object.keys(S.cards).length;
  m.innerHTML = `<button class="back" data-act="go" data-v="${S.tab}">${ic('back')}กลับ</button>
  <div class="view-head"><div><div class="eyebrow">ปรับแต่ง</div><h1>ตั้งค่า</h1></div></div>
  <section class="set-group"><h2>ภาษา</h2>
    <div class="row"><label>ภาษาที่เรียน</label>${seg('lang', [['fr', 'Français'], ['es', 'Español'], ['nl', 'Nederlands']])}</div>
    <div class="row"><label>ภาษาคำแปลหลัก<small>ใช้ทั้งคำแปลคำศัพท์และประโยค</small></label>${seg('trLang', [['th', 'ไทย'], ['en', 'English']])}</div>
  </section>
  <section class="set-group"><h2>หน้าตา</h2>
    <div class="row"><label>ธีม</label>${seg('theme', [['auto', 'ตามระบบ'], ['light', 'สว่าง'], ['dark', 'มืด'], ['sepia', 'กระดาษ']])}</div>
    <div class="row"><label>สีหลัก<small>"ตามภาษา" = ฝรั่งเศสน้ำเงิน · สเปนแดง · ดัตช์ส้ม</small></label>
      <div class="swatches">${[['lang', 'conic-gradient(var(--fr) 0 33%,var(--es) 0 66%,var(--nl) 0)'], ['teal', '#0F8C84'], ['violet', '#7446D6'], ['green', '#2E8540'], ['pink', '#C2367A']].map(([v, c]) => `<button data-act="set" data-k="accent" data-v="${v}" aria-pressed="${s.accent === v}" style="background:${c}" aria-label="${v}"></button>`).join('')}</div></div>
    <div class="row"><label for="fs">ขนาดตัวอักษรบทความ<small id="fsv">${s.fontSize}px</small></label><input id="fs" type="range" min="14" max="28" step="1" value="${s.fontSize}" data-act="range" data-k="fontSize"></div>
    <div class="row"><label for="lh">ระยะห่างบรรทัด<small id="lhv">${s.lineHeight}</small></label><input id="lh" type="range" min="1.4" max="2.2" step="0.05" value="${s.lineHeight}" data-act="range" data-k="lineHeight"></div>
    <div class="row"><label>ฟอนต์บทความ</label>${seg('readFont', [['serif', 'มีเชิง (Literata)'], ['sans', 'ไม่มีเชิง']])}</div>
    <div class="row"><label for="sw-markHard">ขีดเส้นใต้คำยาก</label>${sw('markHard')}</div>
    <div class="row"><label for="sw-markSaved">ไฮไลต์คำที่อยู่ในการ์ดแล้ว</label>${sw('markSaved')}</div>
    <div class="row"><label for="sw-showTrDefault">แสดงคำแปลทุกประโยคตั้งแต่เปิด</label>${sw('showTrDefault')}</div>
  </section>
  <section class="set-group"><h2>คำศัพท์และแฟลชการ์ด</h2>
    <div class="row"><label for="sw-autoSave">บันทึกคำยากอัตโนมัติหลังอ่านจบ</label>${sw('autoSave')}</div>
    <div class="row"><label>เกณฑ์ "คำยาก"<small>อัตโนมัติ = สูงกว่าระดับบทความ 1 ขั้น (อย่างน้อย B1)</small></label>${seg('saveLevel', [['auto', 'อัตโนมัติ'], ['B1', 'B1+'], ['B2', 'B2+'], ['C1', 'C1+']])}</div>
    <div class="row"><label>ด้านหน้าการ์ด</label>${seg('cardDir', [['word', 'คำศัพท์'], ['mean', 'ความหมาย'], ['mix', 'สลับ']])}</div>
    <div class="row"><label>จำนวนการ์ดต่อรอบ</label>${seg('sessionSize', [[10, '10'], [20, '20'], [40, '40'], [100, '100']])}</div>
  </section>
  <section class="set-group"><h2>เสียงอ่าน</h2>
    <div class="row"><label for="rate">ความเร็ว<small id="ratev">${s.rate}×</small></label><input id="rate" type="range" min="0.5" max="1.4" step="0.05" value="${s.rate}" data-act="range" data-k="rate"></div>
    ${Object.keys(LANGS).map(l => `<div class="row"><label>เสียง ${LANGS[l].name}</label>${voiceSel(l)}</div>`).join('')}
    <div class="row"><label>ทดสอบเสียง</label><button class="tbtn" data-act="testvoice">${ic('speaker')}ฟังตัวอย่าง</button></div>
  </section>
  <section class="set-group"><h2>ออนไลน์</h2>
    <div class="row"><label for="sw-online">ใช้พจนานุกรม/คำแปลออนไลน์เมื่อมีเน็ต<small>Wiktionary และ MyMemory · เนื้อหาหลักทั้งหมดใช้งานออฟไลน์ได้</small></label>${sw('online')}</div>
    <div class="row"><label>สถานะ</label><span class="${navigator.onLine ? 'badge good' : 'offline-pill'}">${navigator.onLine ? 'ออนไลน์' : 'ออฟไลน์'}</span></div>
  </section>
  <section class="set-group"><h2>ข้อมูลของฉัน</h2>
    <div class="row"><label>ความคืบหน้า<small>${ncards} การ์ด · อ่านจบ ${Object.keys(S.read).length} เรื่อง · ทำแบบทดสอบ ${Object.keys(S.quiz).length} ชุด</small></label>
      <div class="tools"><button class="tbtn" data-act="export">ส่งออก</button><button class="tbtn" data-act="import">นำเข้า</button></div></div>
    <div class="row" id="ioRow" hidden><textarea id="ioText" spellcheck="false" aria-label="ข้อมูล JSON"></textarea>
      <div class="tools"><button class="tbtn" data-act="copyio">คัดลอก</button><button class="tbtn primary" data-act="doimport">นำเข้าจากข้อความนี้</button><a class="tbtn" id="dlLink" hidden>ดาวน์โหลดไฟล์</a></div></div>
    <div class="row"><label>ล้างข้อมูลทั้งหมด<small>ลบการ์ด ประวัติ และการตั้งค่า</small></label><button class="tbtn" data-act="reset" style="color:var(--bad)">${ic('trash')}ล้างข้อมูล</button></div>
  </section>
  <p class="muted" style="font-size:12.5px">Tríada Reader · เนื้อหาบทความและเรื่องสั้นแต่งขึ้นเพื่อการเรียน เก็บข้อมูลไว้ในเครื่องนี้เท่านั้น</p>`;
}

/* ================= events ================= */
function onClick(e) {
  const w = e.target.closest('.w');
  if (w && !e.target.closest('[data-act]')) { openWord(w); return; }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, s = st();
  switch (a) {
    case 'tab': go(b.dataset.tab); break;
    case 'go': go(b.dataset.v); break;
    case 'lang': s.lang = b.dataset.lang; save(); applyLook(); if (['article', 'story', 'review', 'live'].includes(view.name)) view = { name: S.tab }; render(); break;
    case 'prefs': go('prefs'); break;
    case 'fcat': { const v = b.dataset.v; s.feedCats = !v ? [] : s.feedCats.includes(v) ? s.feedCats.filter(x => x !== v) : [...s.feedCats, v]; save(); render(); break; }
    case 'flvl': { const v = b.dataset.v; s.feedLvls = !v ? [] : s.feedLvls.includes(v) ? s.feedLvls.filter(x => x !== v) : [...s.feedLvls, v]; save(); render(); break; }
    case 'rcat': s.readCat = b.dataset.v; save(); render(); break;
    case 'rlvl': { const v = b.dataset.v; s.readLvls = !v ? [] : s.readLvls.includes(v) ? s.readLvls.filter(x => x !== v) : [...s.readLvls, v]; save(); render(); break; }
    case 'like': { const id = b.dataset.id; S.likes[id] = !S.likes[id]; save(); const p = BYID[id]; b.classList.toggle('liked', !!S.likes[id]); b.innerHTML = ic('heart') + ((p.likes || 0) + (S.likes[id] ? 1 : 0)); break; }
    case 'cmts': { const c = $('.comments', b.closest('.post')); c.hidden = !c.hidden; b.setAttribute('aria-pressed', !c.hidden); break; }
    case 'trpost': { const post = b.closest('.post'); const on = b.getAttribute('aria-pressed') !== 'true'; $$('.rt', post).forEach(r => r.classList.toggle('showtr', on)); b.setAttribute('aria-pressed', on); break; }
    case 'trall': { const on = b.getAttribute('aria-pressed') !== 'true'; const it = BYID[view.id];
      $$('#main .rt').forEach(r => r.classList.toggle('showtr', on)); b.setAttribute('aria-pressed', on);
      if (on && it && it.kind === 'web' && allSentences(it).some(x => !x[st().trLang === 'en' ? 1 : 2])) mtAll(b, it).then(() => b.setAttribute('aria-pressed', 'true'));
      break; }
    case 'trlang': s.trLang = s.trLang === 'th' ? 'en' : 'th'; save(); { const y = scrollY; const open = $$('#main .rt.showtr').length > 0; render(); if (open) { $$('#main .rt').forEach(r => r.classList.add('showtr')); const t = $('[data-act="trall"]'); t && t.setAttribute('aria-pressed', 'true'); } scrollTo(0, y); } break;
    case 'readall': { const root = b.closest('.post') || $('#artBody'); readAll(root, view.name === 'feed' ? BYID[$('.post-end', root).dataset.id].lang : st().lang, b); break; }
    case 'mtall': mtAll(b, BYID[view.id]); break;
    case 'open': go('article', b.dataset.id); break;
    case 'finishweb': { const it = BYID[view.id]; const got = finishItem(it, true); toast(got.length ? `บันทึกคำยาก ${got.length} คำ` : 'บันทึกว่าอ่านจบแล้ว'); break; }
    case 'next-art': { const l = DB[s.lang].read; const i = l.indexOf(BYID[view.id]); const nx = l.find((x, j) => j > i && !S.quiz[x.id]) || l.find(x => !S.quiz[x.id]) || l[(i + 1) % l.length]; go('article', nx.id); break; }
    case 'ans': answer(+b.dataset.qi, +b.dataset.oi); break;
    case 'live': go('live'); break;
    case 'liveopen': openWeb(b.dataset.host, b.dataset.title, b.dataset.src, b); break;
    case 'livetab': liveTab = b.dataset.v; render(); break;
    case 'liverefresh': delete liveCache[s.lang + ':' + liveTab]; render(); break;
    case 'delweb': if (b.dataset.sure) { delete S.web[b.dataset.id]; delete BYID[b.dataset.id]; save(); render(); toast('ลบแล้ว'); } else { b.dataset.sure = 1; b.style.color = 'var(--bad)'; toast('แตะถังขยะอีกครั้งเพื่อลบ'); } break;
    case 'pastego': {
      const raw = ($('#pasteText').value || '').trim(); const title = ($('#pasteTitle').value || '').trim();
      const paras = raw.split(/\n\s*\n|\r?\n/).map(x => x.trim()).filter(x => /\p{L}{2}/u.test(x));
      if (!paras.length || raw.length < 40) { toast('วางเนื้อหาอย่างน้อยหนึ่งย่อหน้า'); break; }
      const t = title || splitSentences(paras[0])[0].slice(0, 80);
      const item = buildWebItem({ lang: s.lang, title: t, paras: title ? paras : paras, src: 'ข้อความของฉัน', id: 'web:own' + hashStr(raw.slice(0, 500) + Date.now()) });
      storeWeb(item); go('article', item.id); break; }
    case 'story': go('story', b.dataset.id); break;
    case 'say': speak(b.dataset.say, sheetState.item.lang); break;
    case 'sayw': speak(b.dataset.say, b.dataset.lang); break;
    case 'saysent': speak(sheetState.sentence.o, sheetState.item.lang); break;
    case 'togglesent': sheetState.sentEl.classList.toggle('open'); closeSheet(); break;
    case 'mtsent': (async () => { const t = $('#shTr'); t.hidden = false; t.textContent = 'กำลังแปล…'; const r = await machineTranslate(sheetState.sentence.o, sheetState.item.lang, st().trLang); t.textContent = r || 'แปลไม่สำเร็จ (ต้องใช้อินเทอร์เน็ต)'; if (r) { $('.tr', sheetState.sentEl).textContent = r; } })(); break;
    case 'closesheet': closeSheet(); break;
    case 'savecard': { const { item, raw, e: en, sentence } = sheetState; const hw = headword(en, raw); const k = cardKey(item.lang, hw); if (S.cards[k]) { delete S.cards[k]; save(); toast('นำออกจากการ์ดแล้ว'); } else { addCard(item.lang, en, raw, sentence.arr, item, false); toast('บันทึก “' + hw + '” แล้ว'); } renderSheet(!!sheetState.onlineRes); refreshMarks(); updateBadge(); if (sheetState.onlineRes) $('#onlineBox').innerHTML = onlineHTML(sheetState.onlineRes); break; }
    case 'savephrase': { const { item, sentence } = sheetState; const k = b.dataset.p; const pe = { w: k, ...parseEntry(item.v[k]) }; if (addCard(item.lang, pe, k, sentence.arr, item, false)) toast('บันทึกสำนวน “' + k + '” แล้ว'); renderSheet(); updateBadge(); break; }
    case 'todict': dictQ = b.dataset.q; dictAll = false; go('dict'); break;
    case 'online': runOnline(); break;
    case 'review': startReview(); break;
    case 'flip': if (rv) { rv.flipped = !rv.flipped; render(); if (rv.flipped) { const c = rv.list[rv.i]; if (st().cardDir !== 'word') speak(c.word, c.lang); } } break;
    case 'grade': { const c = rv.list[rv.i]; const q = +b.dataset.q; grade(S.cards[c.k] || c, q); rv.done++; if (q === 0) { rv.again++; } rv.i++; rv.flipped = false; render(); break; }
    case 'delcard': delete S.cards[b.dataset.k]; save(); render(); toast('ลบการ์ดแล้ว'); break;
    case 'dictq': dictQ = b.dataset.q; if (b.dataset.l && b.dataset.l !== s.lang && dictAll) { } $('#dictInput') ? ($('#dictInput').value = dictQ, dictResults(true)) : go('dict'); scrollTo(0, 0); break;
    case 'dictall': dictAll = !dictAll; b.setAttribute('aria-pressed', dictAll); dictResults(); break;
    case 'dictsave': { const l = b.dataset.lang; const e = DICT[l].get(b.dataset.w.toLowerCase()); const hw = e.lemma || e.w; const k = cardKey(l, hw); if (S.cards[k]) { delete S.cards[k]; toast('นำออกจากการ์ดแล้ว'); } else { const ex = examplesFor(l, e)[0]; addCard(l, e, e.w, ex && ex.s, ex && ex.it, false); toast('บันทึก “' + hw + '” แล้ว'); } save(); dictResults(); updateBadge(); break; }
    case 'dictsaveonline': if (dictOnline) { const { q, r } = dictOnline; sheetState = { onlineRes: r }; addCard(s.lang, null, q, null, null, false); sheetState = null; toast('บันทึก “' + q + '” แล้ว'); updateBadge(); } break;
    case 'set': { const k = b.dataset.k; let v = b.dataset.v; if (k === 'sessionSize') v = +v; s[k] = v; save(); applyLook(); render(); break; }
    case 'testvoice': speak({ fr: 'Bonjour ! Bienvenue dans votre bibliothèque.', es: '¡Hola! Bienvenido a tu biblioteca.', nl: 'Hallo! Welkom in je bibliotheek.' }[s.lang], s.lang); break;
    case 'export': { const row = $('#ioRow'); row.hidden = false; const json = JSON.stringify({ app: 'triada', v: 1, ...S }, null, 1); $('#ioText').value = json; try { const url = URL.createObjectURL(new Blob([json], { type: 'application/json' })); const dl = $('#dlLink'); dl.href = url; dl.download = 'triada-backup.json'; dl.hidden = window.self !== window.top; } catch (er) { } break; }
    case 'import': $('#ioRow').hidden = false; $('#ioText').value = ''; $('#ioText').placeholder = 'วางข้อมูล JSON ที่ส่งออกไว้ตรงนี้'; $('#ioText').focus(); break;
    case 'copyio': { const t = $('#ioText'); navigator.clipboard ? navigator.clipboard.writeText(t.value).then(() => toast('คัดลอกแล้ว'), () => { t.select(); toast('เลือกข้อความแล้ว กดคัดลอกได้เลย'); }) : t.select(); break; }
    case 'doimport': try { const d = JSON.parse($('#ioText').value); if (d.app !== 'triada') throw 0; delete d.app; delete d.v; S = { ...S, ...d, settings: { ...DEFAULTS, ...(d.settings || {}) } }; save(); applyLook(); toast('นำเข้าข้อมูลแล้ว'); render(); } catch (er) { toast('ข้อมูลไม่ถูกต้อง ต้องเป็น JSON ที่ส่งออกจากแอปนี้'); } break;
    case 'reset': if (b.dataset.sure) { try { localStorage.removeItem(KEY); } catch (er) { } S = { settings: { ...DEFAULTS }, cards: {}, read: {}, quiz: {}, likes: {}, history: [], novelPos: {}, web: {}, tab: 'feed' }; applyLook(); toast('ล้างข้อมูลแล้ว'); render(); } else { b.dataset.sure = 1; b.innerHTML = 'แตะอีกครั้งเพื่อยืนยัน'; setTimeout(() => { if (b.isConnected) { delete b.dataset.sure; b.innerHTML = ic('trash') + 'ล้างข้อมูล'; } }, 4000); } break;
  }
}
function refreshMarks() {
  if (!st().markSaved) return;
  $$('#main [data-ctx]').forEach(block => {
    const item = CTX.get(block.dataset.ctx); if (!item) return;
    $$('.w', block).forEach(w => { const e = lookup(item.lang, w.dataset.w, item.v); w.classList.toggle('saved', !!S.cards[cardKey(item.lang, headword(e, w.dataset.w))]); });
  });
}
function onInput(e) {
  const t = e.target, s = st();
  if (t.dataset.act === 'range') { const k = t.dataset.k; s[k] = parseFloat(t.value); save(); applyLook(); const lab = { fontSize: ['#fsv', 'px'], lineHeight: ['#lhv', ''], rate: ['#ratev', '×'] }[k]; $(lab[0]).textContent = s[k] + lab[1]; }
}
function onChange(e) {
  const t = e.target, s = st();
  if (t.dataset.act === 'setb') { s[t.dataset.k] = t.checked; save(); }
  if (t.dataset.act === 'voice') { s.voices[t.dataset.l] = t.value; save(); speak({ fr: 'Bonjour', es: 'Hola', nl: 'Hallo' }[t.dataset.l], t.dataset.l); }
}

/* ================= boot ================= */
function shell() {
  document.getElementById('app').innerHTML = `
  <header class="top"><div class="top-in">
    <div class="brand">Tríada<small>อ่านฝรั่งเศส · สเปน · ดัตช์</small></div>
    <div class="langs" role="group" aria-label="ภาษาที่เรียน">${Object.keys(LANGS).map(l => `<button data-act="lang" data-lang="${l}" title="${LANGS[l].name}">${l.toUpperCase()}</button>`).join('')}</div>
    <button class="iconbtn" data-act="prefs" aria-label="ตั้งค่า">${ic('gear')}</button>
  </div></header>
  <main id="main"></main>
  <nav class="tabs" aria-label="เมนูหลัก"><div class="tabs-in">
    ${[['feed', 'feed', 'ฟีด'], ['read', 'quiz', 'ความรู้'], ['novel', 'book', 'นิยาย'], ['cards', 'cards', 'การ์ด'], ['dict', 'dict', 'พจนานุกรม']].map(([t, i, l]) => `<button data-act="tab" data-tab="${t}">${ic(i)}<span>${l}</span>${t === 'cards' ? '<span class="dot" id="dueDot" hidden></span>' : ''}</button>`).join('')}
  </div></nav>
  <div class="scrim" id="scrim"></div>
  <div class="sheet" id="sheet" role="dialog" aria-label="ความหมายคำ"><div class="sheet-in"></div></div>
  <div class="toast" id="toast" role="status"></div>`;
}
function boot() {
  load(); ingest(); S.web = S.web || {}; for (const it of Object.values(S.web)) BYID[it.id] = it; shell(); applyLook();
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('fc')) { e.preventDefault(); e.target.click(); } });
  $('#scrim').addEventListener('click', closeSheet);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('online', () => view.name === 'dict' || view.name === 'prefs' ? render() : 0);
  addEventListener('offline', () => view.name === 'dict' || view.name === 'prefs' ? render() : 0);
  view = { name: S.tab || 'feed' };
  render();
}
window.TriadaApp = { DB, DICT, lookup, estimateLevel, buildWebItem, splitSentences, state: () => S };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
