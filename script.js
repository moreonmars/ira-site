
const menu=document.querySelector('.menu-overlay'),openBtn=document.querySelector('.menu-button'),closeBtn=document.querySelector('.menu-close');
function setMenu(v){if(!menu)return;menu.classList.toggle('is-open',v);menu.setAttribute('aria-hidden',String(!v));if(openBtn)openBtn.setAttribute('aria-expanded',String(v));document.body.style.overflow=v?'hidden':''}
openBtn?.addEventListener('click',()=>setMenu(true));closeBtn?.addEventListener('click',()=>setMenu(false));document.querySelectorAll('.overlay-nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});document.querySelectorAll('.reveal').forEach(x=>io.observe(x));
const cursor=document.querySelector('.cursor');if(cursor){window.addEventListener('mousemove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});document.querySelectorAll('.magnetic').forEach(x=>{x.addEventListener('mouseenter',()=>cursor.classList.add('visible'));x.addEventListener('mouseleave',()=>cursor.classList.remove('visible'))})}
