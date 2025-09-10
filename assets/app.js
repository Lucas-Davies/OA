
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
  // close on ESC
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

// Close when clicking the backdrop ONLY (not inside the card)
if (modal) {
  modal.addEventListener('click',(e)=>{
    if (e.target === modal) hideModal();
  });
  // stop propagation for clicks inside the auth card
  const card = modal.querySelector('.card');
  if (card) card.addEventListener('click',(e)=>e.stopPropagation());
}

// Password eye toggles (all pages; harmless if none)
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
  if (!welcome) return;           // not on home → skip

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
