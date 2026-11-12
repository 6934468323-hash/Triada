const CACHE='triada-d0b3584ab5';
const CORE=['./','index.html','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','fonts/ibm-plex-sans-thai-thai-400-normal.woff2','fonts/ibm-plex-sans-thai-latin-400-normal.woff2','fonts/ibm-plex-sans-thai-thai-500-normal.woff2','fonts/ibm-plex-sans-thai-latin-500-normal.woff2','fonts/ibm-plex-sans-thai-thai-600-normal.woff2','fonts/ibm-plex-sans-thai-latin-600-normal.woff2','fonts/ibm-plex-sans-thai-thai-700-normal.woff2','fonts/ibm-plex-sans-thai-latin-700-normal.woff2','fonts/literata-latin-wght-normal.woff2','fonts/literata-latin-ext-wght-normal.woff2','fonts/literata-latin-wght-italic.woff2','fonts/literata-latin-ext-wght-italic.woff2','fonts/bricolage-grotesque-latin-600-normal.woff2','fonts/bricolage-grotesque-latin-700-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  const isFont=u.host==='fonts.googleapis.com'||u.host==='fonts.gstatic.com';
  if(u.origin!==location.origin&&!isFont)return; // online APIs go straight to network
  e.respondWith(caches.match(e.request,{ignoreSearch:!isFont}).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}return r;}).catch(()=>hit||caches.match('index.html'));
    return hit||net;
  }));
});
