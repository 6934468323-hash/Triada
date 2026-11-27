#!/usr/bin/env python3
"""Build Tríada Reader.
  docs/            installable offline PWA (served by GitHub Pages) (index.html + sw.js + manifest + icons)
  docs/lexipluma-offline.html   one self-contained file (open it directly, no install needed)
  artifact/index.html        body-only build for publishing as a claude.ai artifact
"""
import pathlib, json, hashlib, shutil, base64

ROOT = pathlib.Path(__file__).parent
SRC, DIST, ART = ROOT / "src", ROOT / "docs", ROOT / "artifact"
DATA = [f"{l}{i}.js" for l in ("fr", "es", "nl") for i in ([""] + list(range(2, 68)))]

css = (SRC / "app.css").read_text()
data = "\n".join((SRC / "data" / f).read_text() for f in DATA)
app = (SRC / "app.js").read_text().replace("/*__SYNC__*/", (SRC / "sync.js").read_text())
fbcfg = (SRC / "firebase-config.js").read_text()
ver = hashlib.sha1((css + data + app + "fonts-v1" + (SRC / "i18n.js").read_text() + (SRC / "firebase-config.js").read_text()).encode()).hexdigest()[:10]

FONTS = ("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700"
         "&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400;1,7..72,600&display=swap")
ICON = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FF7C60"/><stop offset="1" stop-color="#FFB25F"/></linearGradient></defs><rect width="512" height="512" rx="112" fill="#18202D"/><g transform="translate(18 6)"><path d="M118 418c70-12 118-12 168 6" stroke="#8197FF" stroke-width="20" stroke-linecap="round" fill="none"/><path d="M170 356C168 250 250 140 404 92C380 214 300 318 196 362Z" fill="url(#g)"/><path d="M196 362C232 300 300 214 404 92" stroke="#18202D" stroke-width="9" stroke-linecap="round" fill="none" opacity=".55"/><path d="M232 300l-34-6M262 260l-40-10M292 222l-42-14M322 184l-40-16M352 148l-34-14M248 282l30 12M278 242l34 10M310 202l32 8" stroke="#18202D" stroke-width="6" stroke-linecap="round" opacity=".35"/><path d="M196 362L150 420" stroke="#F3F5F8" stroke-width="16" stroke-linecap="round"/><path d="M150 420l-12 18" stroke="#F3F5F8" stroke-width="7" stroke-linecap="round"/></g></svg>"""

i18n = (SRC / "i18n.js").read_text()
body = f"""<div id="app"></div>
<script>{data}</script>
<script>{i18n}</script>
<script>{fbcfg}</script>
<script>{app}</script>"""

# Self-hosted fonts (Fontsource builds of Literata, IBM Plex Sans Thai, Bricolage Grotesque) so text renders the same offline.
LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
LATIN_EXT = "U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"
THAI = "U+0E01-0E5B,U+200C-200D,U+25CC"
FACES = [("IBM Plex Sans Thai", f"ibm-plex-sans-thai-{sub}-{w}-normal.woff2", str(w), "normal", rng) for w in (400, 500, 600, 700) for sub, rng in (("thai", THAI), ("latin", LATIN))] \
      + [("Literata", f"literata-{sub}-wght-{st}.woff2", "200 900", st, rng) for st in ("normal", "italic") for sub, rng in (("latin", LATIN), ("latin-ext", LATIN_EXT))] \
      + [("Bricolage Grotesque", f"bricolage-grotesque-latin-{w}-normal.woff2", str(w), "normal", LATIN) for w in (600, 700)]
def font_css(inline: bool) -> str:
    out = []
    for fam, f, w, st, rng in FACES:
        src = ("data:font/woff2;base64," + base64.b64encode((SRC / "fonts" / f).read_bytes()).decode()) if inline else "fonts/" + f
        out.append(f"@font-face{{font-family:'{fam}';font-style:{st};font-weight:{w};font-display:swap;src:url({src}) format('woff2');unicode-range:{rng}}}")
    return "\n".join(out)

def head(fonts: str) -> str:
    link = f'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="{FONTS}">' if fonts == "google" else f"<style>{font_css(fonts == 'inline')}</style>"
    return f"""<title>LexiPluma</title>
<meta name="claude:viewport-fit-sides" content="cover">
{link}
<style>{css}</style>"""

def full_doc(pwa: bool) -> str:
    extra = ""
    if pwa:
        extra = """<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icon-192.png"><meta name="theme-color" content="#18202D"><meta name="apple-mobile-web-app-capable" content="yes">"""
    sw = """<script>if('serviceWorker' in navigator && location.protocol.startsWith('http')) addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>""" if pwa else ""
    return f"""<!doctype html>
<html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{extra}
{head("files" if pwa else "inline")}
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}} [hidden]{{display:none!important}}</style>
</head><body>
{body}
{sw}
</body></html>"""

SW = f"""const FONTLIST_PLACEHOLDER=0;
const CACHE='lexipluma-{ver}';
const CORE=['./','index.html','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png',FONTLIST];
self.addEventListener('install',e=>{{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))}});
self.addEventListener('activate',e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))}});
self.addEventListener('fetch',e=>{{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  const isFont=u.host==='fonts.googleapis.com'||u.host==='fonts.gstatic.com';
  if(u.origin!==location.origin&&!isFont)return; // online APIs go straight to network
  e.respondWith(caches.match(e.request,{{ignoreSearch:!isFont}}).then(hit=>{{
    const net=fetch(e.request).then(r=>{{if(r&&(r.ok||r.type==='opaque')){{const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}}return r;}}).catch(()=>hit||caches.match('index.html'));
    return hit||net;
  }}));
}});
"""

MANIFEST = {"name": "LexiPluma", "short_name": "LexiPluma", "description": "อ่านภาษาฝรั่งเศส สเปน ดัตช์ แบบออฟไลน์",
            "lang": "th", "start_url": "./", "scope": "./", "display": "standalone", "background_color": "#F3F5F8", "theme_color": "#18202D",
            "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
                      {"src": "icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any"}]}

DIST.mkdir(exist_ok=True); ART.mkdir(exist_ok=True)
(DIST / "index.html").write_text(full_doc(True))
(DIST / "lexipluma-offline.html").write_text(full_doc(False))
(DIST / "sw.js").write_text(SW.replace("const FONTLIST_PLACEHOLDER=0;\n", "").replace("FONTLIST", ",".join(repr("fonts/" + f[1]) for f in FACES)))
(DIST / "fonts").mkdir(exist_ok=True)
for f in FACES: shutil.copy(SRC / "fonts" / f[1], DIST / "fonts" / f[1])
(DIST / "manifest.webmanifest").write_text(json.dumps(MANIFEST, ensure_ascii=False, indent=1))
(DIST / "icon.svg").write_text(ICON)
(ART / "index.html").write_text(head("google") + "\n" + body)

# PNG icons via the preinstalled Playwright/Chromium (optional)
try:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        for size in (192, 512):
            pg = b.new_page(viewport={"width": size, "height": size})
            pg.set_content(f'<body style="margin:0">{ICON.replace("<svg ", f"<svg width={size} height={size} ")}</body>')
            pg.screenshot(path=str(DIST / f"icon-{size}.png"), omit_background=True)
        b.close()
except Exception as e:  # node-only environments: fall back to the SVG icon
    print("PNG icons skipped:", e)
print("built", ver)
