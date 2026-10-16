/* Apps by Talha — Owner Panel + Stats (shared by index.html + download.html)
   - Invisible owner entry: tiny footer glyph + #owner URL hash (bookmark)
   - Owner mode ONLY for the exact owner email; anyone else is signed out
   - Stats tracking (site_stats) is fire-and-forget and never blocks pages
   - Public site is unchanged for non-owners */
(function(){
"use strict";

var OWNER_EMAIL = 'hafiztalhaliaqat373@gmail.com';
window.IS_OWNER = false;

var sadb = null, saAuth = null, SA_OK = false;
try {
  if (typeof firebase !== 'undefined' && window.FIREBASE_CONFIG) {
    if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
    sadb = firebase.firestore();
    saAuth = firebase.auth();
    SA_OK = true;
  }
} catch(e){ SA_OK = false; }

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

/* ---------- toast ---------- */
var toastEl = null;
function saToast(msg){
  if(!toastEl){
    toastEl = document.createElement('div');
    toastEl.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#241a10;color:#f2d675;border:1px solid rgba(212,175,55,.5);padding:11px 20px;border-radius:24px;font-size:14px;font-weight:600;z-index:300;opacity:0;transition:opacity .25s;pointer-events:none;max-width:90vw;text-align:center';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg; toastEl.style.opacity = '1';
  clearTimeout(toastEl._h); toastEl._h = setTimeout(function(){ toastEl.style.opacity='0'; }, 2600);
}
window.saToast = saToast;

/* ---------- shared styles ---------- */
var css = '.sa-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:120;display:none;align-items:flex-end;justify-content:center}'
+'.sa-overlay.open{display:flex}'
+'.sa-modal{background:#101713;border-top:2px solid rgba(212,175,55,.5);border-radius:22px 22px 0 0;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;padding:22px 20px 30px;position:relative}'
+'.sa-modal h3{font-size:17px;margin-bottom:14px;color:#f2d675}'
+'.sa-modal label{display:block;font-size:13px;color:#9db3a6;margin:10px 0 5px}'
+'.sa-modal input{width:100%;background:#0b100d;border:1px solid rgba(255,255,255,.08);border-radius:12px;color:#f1f5f2;padding:11px 13px;font-size:14px;font-family:inherit}'
+'.sa-go{margin-top:16px;width:100%;background:linear-gradient(135deg,#d4af37,#8a6d1f);color:#1c1405;font-weight:800;font-size:15px;border:none;border-radius:12px;padding:13px;cursor:pointer}'
+'.sa-err{font-size:13px;margin-top:10px;min-height:18px;color:#ff9b9b}'
+'.sa-x{position:absolute;top:12px;left:12px;background:none;border:none;color:#9db3a6;font-size:24px;cursor:pointer;padding:4px}'
+'.sa-phead{display:flex;align-items:center;margin-bottom:12px}.sa-phead h3{margin:0;flex:1}'
+'.sa-mini{background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.4);color:#f2d675;border-radius:10px;padding:7px 12px;font-size:13px;font-weight:700;cursor:pointer;margin-left:6px;font-family:inherit}'
+'.sa-cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}'
+'.sa-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;text-align:center}'
+'.sa-card .v{font-size:24px;font-weight:800;color:#f2d675}'
+'.sa-card .k{font-size:12px;color:#9db3a6;margin-top:3px}'
+'.sa-sec{font-size:14px;font-weight:800;margin:14px 0 8px;color:#f1f5f2}'
+'.sa-days{display:flex;flex-direction:column;gap:6px}'
+'.sa-day{display:flex;justify-content:space-between;font-size:13px;color:#9db3a6;background:rgba(255,255,255,.03);border-radius:10px;padding:8px 12px}'
+'.sa-day b{color:#f1f5f2}'
+'.sa-tbl{width:100%;border-collapse:collapse;font-size:13px}'
+'.sa-tbl th{text-align:right;color:#9db3a6;font-weight:700;padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.1);font-size:12px}'
+'.sa-tbl td{padding:9px 6px;border-bottom:1px solid rgba(255,255,255,.05);color:#f1f5f2;text-align:right}'
+'.sa-tbl td:first-child{text-align:left}'
+'.sa-tbl th:first-child{text-align:left}'
+'.sa-note{font-size:13.5px;color:#9db3a6;text-align:center;padding:18px 8px;line-height:1.8}'
+'.sa-hint{font-size:13px;color:#f2d675;line-height:1.8;background:rgba(212,175,55,.07);border:1px solid rgba(212,175,55,.35);border-radius:12px;padding:12px 14px;margin-top:10px}'
+'.olike{font-size:14px;margin-left:2px}'
+'.oreply{margin-top:10px;background:rgba(212,175,55,.07);border:1px solid rgba(212,175,55,.4);border-radius:12px;padding:10px 12px}'
+'.oreply .orh{font-size:12.5px;font-weight:800;color:#f2d675;display:flex;align-items:center}'
+'.oreply .orh .dt{margin-left:auto;font-weight:400;color:#9db3a6;font-size:11.5px}'
+'.oreply .ort{font-size:13.5px;color:#f1f5f2;margin-top:6px;line-height:1.65}'
+'.octl{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}'
+'.obtn{background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.45);color:#f2d675;border-radius:10px;padding:7px 13px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit}'
+'.obtn.danger{background:rgba(220,60,60,.1);border-color:rgba(220,60,60,.5);color:#ff9b9b}'
+'.oreplybox textarea{width:100%;background:#0b100d;border:1px solid rgba(255,255,255,.08);border-radius:10px;color:#f1f5f2;padding:10px;font-size:13.5px;font-family:inherit;resize:vertical;margin-top:8px}'
+'#sa-panelbtn{position:fixed;bottom:18px;left:18px;z-index:110;background:linear-gradient(135deg,#d4af37,#8a6d1f);color:#1c1405;font-weight:800;font-size:14px;border:none;border-radius:30px;padding:12px 20px;cursor:pointer;box-shadow:0 8px 22px rgba(212,175,55,.4);font-family:inherit}';
var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

/* ---------- login modal ---------- */
var loginOv = document.createElement('div');
loginOv.className = 'sa-overlay'; loginOv.id = 'sa-login-ov';
loginOv.innerHTML = '<div class="sa-modal"><button class="sa-x" id="sa-login-x">×</button>'
  +'<h3>🔒 Owner Login</h3>'
  +'<label>Email</label><input type="email" id="sa-email" autocomplete="username" placeholder="Owner email">'
  +'<label>Password</label><input type="password" id="sa-pass" autocomplete="current-password" placeholder="Password">'
  +'<button class="sa-go" id="sa-login-btn">Login karein</button>'
  +'<div class="sa-err" id="sa-login-err"></div></div>';
document.body.appendChild(loginOv);
document.getElementById('sa-login-x').onclick = function(){ loginOv.classList.remove('open'); };
loginOv.addEventListener('click', function(e){ if(e.target===loginOv) loginOv.classList.remove('open'); });

function openLogin(){
  if(!SA_OK){ saToast('Login abhi uplabdh nahi'); return; }
  document.getElementById('sa-login-err').textContent = '';
  loginOv.classList.add('open');
}

document.getElementById('sa-login-btn').onclick = function(){
  var em = document.getElementById('sa-email').value.trim();
  var pw = document.getElementById('sa-pass').value;
  var errEl = document.getElementById('sa-login-err');
  errEl.textContent = '';
  if(!em || !pw){ errEl.textContent = 'Email aur password dono likhein.'; return; }
  saAuth.signInWithEmailAndPassword(em, pw).then(function(cred){
    if(cred.user && cred.user.email === OWNER_EMAIL){
      loginOv.classList.remove('open');
      document.getElementById('sa-pass').value = '';
      saToast('Owner mode ON 👑');
    } else {
      saAuth.signOut();
      errEl.textContent = 'Ye owner account nahi hai.';
    }
  }).catch(function(){
    errEl.textContent = 'Login nahi ho saka — email/password check karein.';
  });
};

/* ---------- discreet entry: tiny footer glyph + #owner hash ---------- */
(function initEntry(){
  var f = document.querySelector('footer');
  if(f && !document.getElementById('sa-odot')){
    var w = document.createElement('div');
    var a = document.createElement('a');
    a.id = 'sa-odot'; a.href = '#owner'; a.setAttribute('aria-hidden','true'); a.tabIndex = -1;
    a.textContent = '🔒';
    a.style.cssText = 'display:inline-block;margin-top:10px;font-size:9px;opacity:.22;text-decoration:none;line-height:1;cursor:default';
    w.appendChild(a); f.appendChild(w);
  }
  function checkHash(){
    if(location.hash === '#owner'){
      openLogin();
      try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){}
    }
  }
  checkHash();
  window.addEventListener('hashchange', checkHash);
})();

/* ---------- owner panel button (only ever created in owner mode) ---------- */
var panelBtn = null;
function showPanelBtn(){
  if(panelBtn || !document.body) return;
  panelBtn = document.createElement('button');
  panelBtn.id = 'sa-panelbtn'; panelBtn.textContent = '👑 Owner Panel';
  panelBtn.onclick = openPanel;
  document.body.appendChild(panelBtn);
}
function hidePanelBtn(){
  if(panelBtn){ panelBtn.remove(); panelBtn = null; }
  var p = document.getElementById('sa-panel-ov');
  if(p) p.classList.remove('open');
}

/* ---------- auth state: double-lock ---------- */
if(SA_OK && saAuth){
  saAuth.onAuthStateChanged(function(u){
    if(u && u.email === OWNER_EMAIL){
      window.IS_OWNER = true; showPanelBtn();
    } else {
      window.IS_OWNER = false; hidePanelBtn();
      if(u){ try{ saAuth.signOut(); }catch(e){} saToast('Ye owner account nahi hai'); }
    }
  });
}

/* ---------- stats tracking (fire-and-forget, never blocks) ---------- */
function dayStr(off){
  var d = new Date(); d.setDate(d.getDate() + (off||0));
  var m = ''+(d.getMonth()+1), dy = ''+d.getDate();
  return d.getFullYear()+'-'+(m.length<2?'0':'')+m+'-'+(dy.length<2?'0':'')+dy;
}
function statHit(doc, fields){
  try{
    if(!SA_OK) return;
    var o = {};
    for(var k in fields) o[k] = firebase.firestore.FieldValue.increment(fields[k]);
    sadb.collection('site_stats').doc(doc).set(o, {merge:true}).catch(function(){});
  }catch(e){}
}
function saTrackVisit(){
  statHit('global', {visits:1});
  statHit('daily_'+dayStr(0), {visits:1});
}
function saTrackDownload(appId){
  statHit('global', {downloads:1});
  statHit('daily_'+dayStr(0), {downloads:1});
  if(appId) statHit('app_'+appId, {downloads:1});
}
window.saTrackVisit = saTrackVisit;
window.saTrackDownload = saTrackDownload;
saTrackVisit();

/* ---------- owner panel ---------- */
var panelOv = document.createElement('div');
panelOv.className = 'sa-overlay'; panelOv.id = 'sa-panel-ov';
panelOv.innerHTML = '<div class="sa-modal"><div class="sa-phead"><h3>👑 Owner Panel</h3>'
  +'<button class="sa-mini" id="sa-refresh">↻</button>'
  +'<button class="sa-mini" id="sa-logout">Logout</button>'
  +'<button class="sa-x" id="sa-panel-x" style="position:static;margin-left:6px">×</button></div>'
  +'<div id="sa-pbody"></div></div>';
document.body.appendChild(panelOv);
document.getElementById('sa-panel-x').onclick = function(){ panelOv.classList.remove('open'); };
panelOv.addEventListener('click', function(e){ if(e.target===panelOv) panelOv.classList.remove('open'); });
document.getElementById('sa-logout').onclick = function(){
  if(saAuth){ try{ saAuth.signOut(); }catch(e){} }
  panelOv.classList.remove('open'); saToast('Logout ho gaya');
};
document.getElementById('sa-refresh').onclick = loadPanelData;

function openPanel(){
  if(!window.IS_OWNER) return;
  panelOv.classList.add('open');
  loadPanelData();
}
window.saOpenPanel = openPanel;

function statsHintHTML(){
  return '<div class="sa-hint">📊 Stats ke liye naye Firestore rules publish karna baqi hain — Mano ke diye gaye rules Firebase Console me paste karein. Us ke baad ye panel khud kaam karega.</div>';
}

function dayLabel(ds){
  try{
    var p = ds.split('-');
    var d = new Date(+p[0], +p[1]-1, +p[2]);
    return d.toLocaleDateString('en-PK',{day:'numeric',month:'short'});
  }catch(e){ return ds; }
}

async function loadPanelData(){
  var body = document.getElementById('sa-pbody');
  body.innerHTML = '<div class="sa-note">Stats load ho rahe hain…</div>';
  if(!SA_OK || !window.IS_OWNER){ body.innerHTML = statsHintHTML(); return; }
  var apps = (typeof APPS !== 'undefined') ? APPS : [];
  try{
    var g = await sadb.collection('site_stats').doc('global').get();
    var gd = (g && g.exists) ? g.data() : {};
    var days = [];
    for(var i=0;i<7;i++) days.push(dayStr(-i));
    var dsnaps = await Promise.all(days.map(function(d){
      return sadb.collection('site_stats').doc('daily_'+d).get().then(function(s){return s;}, function(){return null;});
    }));
    var perApp = await Promise.all(apps.map(function(a){
      var dlP = sadb.collection('site_stats').doc('app_'+a.id).get().then(function(s){
        return (s && s.exists && typeof s.data().downloads==='number') ? s.data().downloads : 0;
      }, function(){ return null; });
      var rvP = sadb.collection('site_reviews').where('app','==',a.id).limit(200).get().then(function(s){
        var n=0, t=0;
        s.forEach(function(d){ n++; var r=d.data().rating; if(typeof r==='number') t+=r; });
        return {n:n, avg:n ? t/n : 0};
      }, function(){ return null; });
      return Promise.all([dlP, rvP]).then(function(r){ return {app:a, downloads:r[0], rev:r[1]}; });
    }));
    renderPanel(gd, days, dsnaps, perApp);
  }catch(e){
    body.innerHTML = statsHintHTML();
  }
}

function renderPanel(gd, days, dsnaps, perApp){
  var body = document.getElementById('sa-pbody');
  var visits = (typeof gd.visits==='number') ? gd.visits : 0;
  var downloads = (typeof gd.downloads==='number') ? gd.downloads : 0;
  var todaySnap = dsnaps[0], td = (todaySnap && todaySnap.exists) ? todaySnap.data() : {};
  var tv = (typeof td.visits==='number') ? td.visits : 0;
  var tdl = (typeof td.downloads==='number') ? td.downloads : 0;

  var h = '<div class="sa-cards">'
    +'<div class="sa-card"><div class="v">'+visits+'</div><div class="k">Kul Visits</div></div>'
    +'<div class="sa-card"><div class="v">'+tv+'</div><div class="k">Aaj ke Visits</div></div>'
    +'<div class="sa-card"><div class="v">'+downloads+'</div><div class="k">Kul Downloads</div></div>'
    +'<div class="sa-card"><div class="v">'+tdl+'</div><div class="k">Aaj ki Downloads</div></div></div>';

  h += '<div class="sa-sec">📅 Pichhle 7 din</div><div class="sa-days">';
  for(var i=0;i<days.length;i++){
    var s = dsnaps[i], d = (s && s.exists) ? s.data() : {};
    var v = (typeof d.visits==='number') ? d.visits : 0;
    var dl = (typeof d.downloads==='number') ? d.downloads : 0;
    h += '<div class="sa-day"><span>'+dayLabel(days[i])+(i===0?' (aaj)':'')+'</span><span><b>'+v+'</b> visits • <b>'+dl+'</b> downloads</span></div>';
  }
  h += '</div>';

  h += '<div class="sa-sec">📱 Har App</div><table class="sa-tbl"><tr><th>App</th><th>Downloads</th><th>Reviews</th><th>Avg ★</th></tr>';
  var anyNull = false;
  perApp.forEach(function(r){
    if(r.downloads===null || r.rev===null) anyNull = true;
    var dlT = (r.downloads===null) ? '—' : r.downloads;
    var rvT = (r.rev===null) ? '—' : r.rev.n;
    var avT = (r.rev===null) ? '—' : (r.rev.n ? r.rev.avg.toFixed(1) : '—');
    h += '<tr><td>'+esc(r.app.name)+'</td><td>'+dlT+'</td><td>'+rvT+'</td><td>'+avT+'</td></tr>';
  });
  h += '</table>';
  if(anyNull) h += statsHintHTML();
  body.innerHTML = h;
}

})();
