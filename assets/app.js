// ---------- Helpers ----------
const q  = (id)=>document.getElementById(id);
const on = (el,ev,fn)=> el && el.addEventListener(ev,fn);

// ---------- Session helpers ----------
function getSession(){
  try { return JSON.parse(localStorage.getItem('session')||'null'); }
  catch(e){ return null; }
}
function setSession(obj){
  try { localStorage.setItem('session', JSON.stringify(obj)); } catch(e){}
}
function clearSession(){
  try { localStorage.removeItem('session'); } catch(e){}
}

// ---------- Modal (index) ----------
const modal     = q('loginModal');
const openLogin = q('openLogin');        // button on index hero

function showModal(){
  if(!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  window.addEventListener('keydown', escClose);
}
function hideModal(){
  if(!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
  window.removeEventListener('keydown', escClose);
}
function escClose(e){
  if(e.key === 'Escape') hideModal();
}
on(openLogin,'click',showModal);

if (modal) {
  modal.addEventListener('click',(e)=>{
    if (e.target === modal) hideModal();
  });
  const card = modal.querySelector('.card');
  if (card) card.addEventListener('click',(e)=>e.stopPropagation());
}

document.querySelectorAll('.eye').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const inp = document.querySelector(btn.dataset.eye);
    if(!inp) return;
    const to = inp.type === 'password' ? 'text' : 'password';
    inp.type = to;
    btn.textContent = to === 'password' ? 'Show' : 'Hide';
  });
});

// ---------- Login & Join Free (index) ----------
const DEMO_EMAIL = 'demo@demo';
const DEMO_PW    = 'letmein';

const loginForm = q('loginForm');
const emailInp  = q('email');
const passInp   = q('password');
const authMsg   = q('authMsg');
const joinFree  = q('joinFree');

on(loginForm,'submit',(e)=>{
  e.preventDefault();
  if (authMsg) authMsg.hidden = true;

  const em = (emailInp?.value||'').trim().toLowerCase();
  const pw = (passInp?.value||'');

  const ok = (em === DEMO_EMAIL || em.endsWith('@example.com')) && pw === DEMO_PW;

  if (ok){
    setSession({ user: em || 'demo@demo', kind:'login', ts:Date.now() });
    window.location.href = 'home.html';
  } else if (authMsg){
    authMsg.textContent = 'Invalid login. Use demo@demo / letmein.';
    authMsg.hidden = false;
  }
});

on(joinFree,'click',()=>{
  setSession({ user:'guest', kind:'free', ts:Date.now() });
  window.location.href = 'home.html';
});

// ---------- Home-only behaviour (guard + upsell + welcome) ----------
document.addEventListener('DOMContentLoaded', ()=>{
  const welcome = q('welcome');   // only exists on home.html
  if (!welcome) return;

  const session = getSession();
  if (!session){
    window.location.replace('index.html');
    return;
  }

  const label = session.kind === 'free'
    ? 'Guest'
    : ((session.user||'').split('@')[0] || 'Member');

  welcome.textContent = `Hi, ${label}`;

  const upsell = q('upsell');
  if (upsell) upsell.hidden = session.kind !== 'free';
});

// ---------- Sign out (home) ----------
const logoutBtn = q('logoutBtn');
on(logoutBtn,'click', ()=>{
  clearSession();
  window.location.href = 'index.html';
});

// ---------- Home app behaviour ----------
(()=>{'use strict';
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const pad=n=>String(n).padStart(2,'0');
const toISO=d=>d.toISOString().slice(0,10);
const K={ sub:'ao_sub', points:'ao_points', purchasedA:'ao_purchased', purchasedB:'ao_purchasedCourses',
          weeklyDone:'ao_weekly_done', dailyDone:'ao_daily_done' };
const store={ get:(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}},
              set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)), del:k=>localStorage.removeItem(k) };
const compactK = n => (n>=1000? ((Math.round(n/100)/10).toFixed(1).replace(/\.0$/,'')+'k'): String(n));
const capFirst = s => (s||'').replace(/\b\w/g,m=>m.toUpperCase());

/* ===== Tabs ===== */
const tabBtns=$$('.btn-tab[data-tab]');
const panels=$$('[data-panel]');
tabBtns.forEach(b=>b.addEventListener('click', ()=>{
  tabBtns.forEach(x=>{x.classList.toggle('is-active',x===b); x.setAttribute('aria-selected', x===b?'true':'false');});
  panels.forEach(p=>p.classList.toggle('hide', p.dataset.panel!==b.dataset.tab));
  window.scrollTo({top:0,behavior:'smooth'});
}));

/* ===== Avatar ===== */
let isSub=!!store.get(K.sub,false);
let points=+store.get(K.points,0);
let purchased=(store.get(K.purchasedB,null)??store.get(K.purchasedA,[]));
if(!Array.isArray(purchased)) purchased=[];
let weeklyDone=store.get(K.weeklyDone,[]);
let dailyDone=store.get(K.dailyDone,[]);

const avatarBtn = $('#avatarTab');
const avatarSheet = $('#avatarSheet');
const subToggle = $('#subToggle');
const pointsBadge = $('#pointsBadge');

function paintAvatar(){
  pointsBadge.textContent = compactK(points);
  avatarBtn.classList.toggle('gold', isSub);
  avatarBtn.classList.toggle('silver', !isSub);
  subToggle.textContent = isSub?'On':'Off';
  subToggle.className = 'btn ' + (isSub?'green':'grey');
  subToggle.setAttribute('aria-pressed', isSub?'true':'false');
}
paintAvatar();

avatarBtn?.addEventListener('click', ()=>{
  const willOpen = !avatarSheet.classList.contains('open');
  avatarSheet.classList.toggle('open', willOpen);
  avatarSheet.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
  avatarBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
});
$('#closeSheet')?.addEventListener('click', ()=>{
  avatarSheet.classList.remove('open');
  avatarSheet.setAttribute('aria-hidden','true');
  avatarBtn.setAttribute('aria-expanded','false');
});
$('#uploadAvatar')?.addEventListener('click', (e)=>{
  e.preventDefault();
  alert('Avatar upload coming soon.');
});
subToggle?.addEventListener('click', ()=>{
  isSub = !isSub;
  store.set(K.sub, isSub);
  paintAvatar();
  paintGating();
  paintWeeklies();
});
avatarSheet?.addEventListener('click', (e)=>{
  if (e.target === avatarSheet) {
    avatarSheet.classList.remove('open');
    avatarSheet.setAttribute('aria-hidden','true');
    avatarBtn.setAttribute('aria-expanded','false');
  }
});
window.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape' && avatarSheet.classList.contains('open')) {
    avatarSheet.classList.remove('open');
    avatarSheet.setAttribute('aria-hidden','true');
    avatarBtn.setAttribute('aria-expanded','false');
  }
});

/* ===== Daily date & toggle ===== */
const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const today=new Date(), isoToday=toISO(today);
$('#dailyDate')?.textContent = `${dayNames[today.getDay()]} ${pad(today.getDate())}/${pad(today.getMonth()+1)}`;

function paintDaily(){
  const done = dailyDone.includes(isoToday);
  $('#btnDaily').textContent = done?'Undo':'Complete';
  $('#btnDaily').className = 'btn ' + (done?'grey':'blue');
  $('#dailyHero').classList.toggle('complete', done);
}
paintDaily();
$('#btnDaily')?.addEventListener('click', ()=>{
  const idx=dailyDone.indexOf(isoToday);
  if(idx===-1){ dailyDone.push(isoToday); points+=1; }
  else{ dailyDone.splice(idx,1); points=Math.max(0,points-1); }
  store.set(K.dailyDone,dailyDone); store.set(K.points,points);
  paintDaily(); paintAvatar();
});

/* ===== Daily loader ===== */
async function getDailyTotal(){
  try{
    const res = await fetch('./challenges/daily/index.json?ts='+Date.now(), { cache:'no-store' });
    if(!res.ok) throw new Error('missing index.json');
    const { count } = await res.json();
    return +count || 1;
  }catch{ return 1; }
}
function getDayOfYear(d){
  const start = new Date(d.getFullYear(),0,0);
  return Math.floor((d - start) / 86400000);
}
function chip(label, value){
  if(!value) return '';
  return `<span class="chip"><span class="k">${label}:</span><span class="v">${capFirst(value)}</span></span>`;
}
async function loadDailyChallenge(){
  const total = await getDailyTotal();
  const doy = getDayOfYear(new Date());
  const idx = ((doy - 1) % total) + 1;
  const file = `./challenges/daily/d${idx}.json?ts=${Date.now()}`;

  try{
    const res = await fetch(file, { cache:'no-store' });
    if(!res.ok) throw new Error(`Missing ${file}`);
    const data = await res.json();

    $('#dailyTitle').textContent = data.title || 'Daily Challenge';
    $('#dailyDesc').textContent  = data.desc || '';

    let chipsHTML =
      chip('Medium', data.medium) +
      chip('Time', data.time) +
      chip('Level', data.level);

    if (Array.isArray(data.tags)){
      chipsHTML += data.tags.map(t=>chip('Tag', t)).join('');
    }
    $('#dailyMeta').innerHTML = chipsHTML;

    if (data.image){
      document.documentElement.style.setProperty('--daily-art', `url("${data.image}")`);
    } else {
      document.documentElement.style.setProperty('--daily-art', 'none');
    }

    if (new URLSearchParams(location.search).get('debug')==='1'){
      const badge = document.getElementById('debugBadge');
      badge.classList.add('show');
      badge.textContent = `Loaded: d${idx}.json • keys: ${Object.keys(data).join(', ')}`;
      console.log('[Daily]', {picked:`d${idx}.json`, data});
    }
  }catch(err){
    console.error('[Daily] Load failed', err);
    $('#dailyTitle').textContent = 'Daily Challenge';
    $('#dailyDesc').textContent  = 'New prompt coming soon.';
    $('#dailyMeta').innerHTML = '';
    document.documentElement.style.setProperty('--daily-art', 'none');
  }
}
loadDailyChallenge();

/* ===== Weekly etc. ===== */
const DEFAULT_WEEKLY = [
  {id:'W1', title:'Ink Portrait', desc:'Brush + splash accents.'},
  {id:'W2', title:'Value Composition', desc:'Design with 3 clear values.'},
  {id:'W3', title:'Edges & Atmosphere', desc:'Depth via soft transitions.'}
];
function weeklyOrder(list){
  const doneSet=new Set(weeklyDone);
  return list.slice().sort((a,b)=>{
    const A=doneSet.has(a.id), B=doneSet.has(b.id);
    return (A===B)?0 : (A?1:-1);
  });
}
function padlockSVG(){
  return `<span class="padlock" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path class="shackle" d="M7 11V8.5a5 5 0 0 1 10 0V11"/></svg>
    <svg viewBox="0 0 24 24" style="position:absolute;inset:0;opacity:0"><rect class="body" x="3" y="11" width="18" height="10" rx="2"/><circle class="keyhole" cx="12" cy="16" r="1.3"/><rect class="keyhole" x="11.2" y="14.7" width="1.6" height="2.8" rx=".6"/></svg>
  </span>`;
}
function paintWeeklies(list){
  list = list && list.length ? list : DEFAULT_WEEKLY;
  const grid = $('#weeklyGrid'); grid.innerHTML='';
  const now=new Date();
  weeklyOrder(list).slice(0,3).forEach(w=>{
    const done = weeklyDone.includes(w.id);
    const el = document.createElement('article');
    el.className = 'hero tall' + (done?' complete':'');
    el.dataset.week = w.id;
    el.innerHTML = `
      <h4 class="title">${isSub?'':padlockSVG()} ${w.title}</h4>
      <p class="meta">Sun ${pad(now.getDate())}/${pad(now.getMonth()+1)}</p>
      <p class="desc">${w.desc||''}</p>
      <div class="cta-left">
        <a class="btn ${isSub?'blue':''}" ${isSub?'':'aria-disabled="true"'} ${isSub?'href="challenges/weekly-${w.id}.html"':''}>Start Challenge</a>
      </div>`;
    grid.appendChild(el);
  });
}
window.AO_markWeeklyComplete = function(weekId){
  if(!weeklyDone.includes(weekId)){
    weeklyDone.push(weekId);
    store.set(K.weeklyDone, weeklyDone);
    points += 10; store.set(K.points,points); paintAvatar(); paintWeeklies();
  }
};

/* ===== Pricing/Registry ===== */
let pricing = {};
function readPricing(){
  if(window.PRICE_LIST) pricing = window.PRICE_LIST;
  else{ try{ pricing=JSON.parse(document.getElementById('pricingData').textContent||'{}'); }catch{ pricing={}; } }
}
readPricing();

async function loadRegistry(){
  try{
    const res = await fetch('./data/registry.json?ts='+Date.now(), {cache:'no-store'});
    if(!res.ok) throw new Error('no registry');
    return await res.json();
  }catch{
    try{ return JSON.parse(document.getElementById('registryData').textContent||'{}'); }
    catch{ return {}; }
  }
}
function cloneTemplate(selector){ return document.querySelector(selector).cloneNode(true); }
function applyPricePoints(card, price, pts){
  const priceEl = card.querySelector('.price'); const ptsEl = card.querySelector('.pts');
  if(priceEl && price){ priceEl.dataset.price = price; priceEl.firstElementChild.textContent = price; }
  if(ptsEl && (pts!=null)){ ptsEl.dataset.pts = pts; ptsEl.firstElementChild.textContent = pts; }
}
function renderFromRegistry(reg){
  const fGrid = document.getElementById('foundationsGrid'); fGrid.innerHTML='';
  (reg.foundations||[]).filter(x=>x.showOnHome!==false).forEach(item=>{
    const t = cloneTemplate('#templates > article[data-kind="foundation"]');
    t.dataset.id = item.id; t.querySelector('.t').textContent = item.title;
    t.dataset.link = `courses/${item.slug||item.id}.html`;
    fGrid.appendChild(t);
  });

  const one = document.getElementById('oneDayGrid'); one.innerHTML='';
  (reg.courses?.["1day"]||[]).filter(x=>x.showOnHome!==false).forEach(item=>{
    const t = cloneTemplate('#templates > article[data-kind="paid"]');
    t.dataset.id = item.id; t.querySelector('.t').textContent = item.title;
    t.dataset.link = `courses/${item.slug||item.id}.html`; applyPricePoints(t, item.price, item.points); one.appendChild(t);
  });
  const three = document.getElementById('threeDayGrid'); three.innerHTML='';
  (reg.courses?.["3day"]||[]).filter(x=>x.showOnHome!==false).forEach(item=>{
    const t = cloneTemplate('#templates > article[data-kind="paid"]');
    t.dataset.id = item.id; t.querySelector('.t').textContent = item.title;
    t.dataset.link = `courses/${item.slug||item.id}.html`; applyPricePoints(t, item.price, item.points); three.appendChild(t);
  });
  const thirty = document.getElementById('thirtyDayGrid'); thirty.innerHTML='';
  (reg.courses?.["30day"]||[]).filter(x=>x.showOnHome!==false).forEach(item=>{
    const t = cloneTemplate('#templates > article[data-kind="paid"]');
    t.dataset.id = item.id; t.querySelector('.t').textContent = item.title;
    t.dataset.link = `courses/${item.slug||item.id}.html`; applyPricePoints(t, item.price, item.points); thirty.appendChild(t);
  });

  const demoGrid = document.getElementById('demoGrid'); demoGrid.innerHTML='';
  const hasDemo = (reg.demos||[]).some(d=>d.showOnHome!==false);
  if(hasDemo){ demoGrid.appendChild(cloneTemplate('#templates > article[data-kind="demo"]')); }
}
loadRegistry().then(reg=>{
  renderFromRegistry(reg);
  paintGating(); repaintPurchases();
  const weekly = reg.weekly?.filter(x=>x.showOnHome!==false).map(x=>({id:x.id,title:x.title,desc:x.desc||''})) || null;
  paintWeeklies(weekly);
});

/* ===== Gating & Purchases ===== */
function paintGating(){
  $$('.course[data-kind="foundation"]').forEach(card=>{
    const btn