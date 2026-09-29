// BeatForge offline cache: the game page is network-first (so updates show up), everything else cache-first.
const CACHE='beatforge-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const put=(req,res)=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res};
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);
  if(u.origin===location.origin){
    if(req.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){
      e.respondWith(Promise.race([fetch(req).then(r=>put(req,r)),new Promise((_,no)=>setTimeout(no,4000))]).catch(()=>caches.match(req,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));return}
    e.respondWith(caches.match(req,{ignoreSearch:true}).then(m=>m||fetch(req).then(r=>put(req,r))));return}
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>put(req,r))))});
