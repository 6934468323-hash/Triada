#!/usr/bin/env python3
"""Build Tríada Reader.
  docs/            installable offline PWA (served by GitHub Pages) (index.html + sw.js + manifest + icons)
  docs/triada-offline.html   one self-contained file (open it directly, no install needed)
  artifact/index.html        body-only build for publishing as a claude.ai artifact
"""
import pathlib, json, hashlib, shutil

ROOT = pathlib.Path(__file__).parent
SRC, DIST, ART = ROOT / "src", ROOT / "docs", ROOT / "artifact"
DATA = ["fr.js", "fr2.js", "fr3.js", "es.js", "es2.js", "es3.js", "nl.js", "nl2.js", "nl3.js"]

css = (SRC / "app.css").read_text()
data = "\n".join((SRC / "data" / f).read_text() for f in DATA)
app = (SRC / "app.js").read_text()
ver = hashlib.sha1((css + data + app).encode()).hexdigest()[:10]

FONTS = ("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700"
         "&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400;1,7..72,600&display=swap")
ICON = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#18202D"/>
<path d="M136 150h240" stroke="#8197FF" stroke-width="34" stroke-linecap="round"/><path d="M136 236h170" stroke="#FF7C60" stroke-width="34" stroke-linecap="round"/>
<path d="M136 322h210" stroke="#FF9C4F" stroke-width="34" stroke-linecap="round"/><circle cx="372" cy="356" r="30" fill="#F3F5F8"/></svg>"""

body = f"""<div id="app"></div>
<script>{data}</script>
<script>{app}</script>"""

head_common = f"""<title>Tríada Reader</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
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
{head_common}
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}} [hidden]{{display:none!important}}</style>
</head><body>
{body}
{sw}
</body></html>"""

SW = f"""const CACHE='triada-{ver}';
const CORE=['./','index.html','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png'];
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

MANIFEST = {"name": "Tríada Reader", "short_name": "Tríada", "description": "อ่านภาษาฝรั่งเศส สเปน ดัตช์ แบบออฟไลน์",
            "lang": "th", "start_url": "./", "scope": "./", "display": "standalone", "background_color": "#F3F5F8", "theme_color": "#18202D",
            "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
                      {"src": "icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any"}]}

DIST.mkdir(exist_ok=True); ART.mkdir(exist_ok=True)
(DIST / "index.html").write_text(full_doc(True))
(DIST / "triada-offline.html").write_text(full_doc(False))
(DIST / "sw.js").write_text(SW)
(DIST / "manifest.webmanifest").write_text(json.dumps(MANIFEST, ensure_ascii=False, indent=1))
(DIST / "icon.svg").write_text(ICON)
(ART / "index.html").write_text(head_common + "\n" + body)

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
