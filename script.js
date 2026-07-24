const body = document.body;
const overlay = document.querySelector('#menuOverlay');
const openButtons = document.querySelectorAll('.menu-button');
const closeButton = document.querySelector('.menu-close');

function openMenu() {
  overlay?.classList.add('is-open');
  overlay?.setAttribute('aria-hidden', 'false');
  openButtons.forEach(button => button.setAttribute('aria-expanded', 'true'));
  body.classList.add('menu-open');
}
function closeMenu() {
  overlay?.classList.remove('is-open');
  overlay?.setAttribute('aria-hidden', 'true');
  openButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
  body.classList.remove('menu-open');
}
openButtons.forEach(button => button.addEventListener('click', openMenu));
closeButton?.addEventListener('click', closeMenu);
overlay?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const cursor = document.querySelector('.cursor');
if (cursor && window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('mousemove', event => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });
  document.querySelectorAll('.magnetic').forEach(item => {
    item.addEventListener('mouseenter', () => cursor.classList.add('show'));
    item.addEventListener('mouseleave', () => cursor.classList.remove('show'));
  });
}

const heroImage = document.querySelector('.hero-media');
window.addEventListener('scroll', () => {
  if (!heroImage) return;
  heroImage.style.transform = `scale(1.03) translateY(${window.scrollY * 0.055}px)`;
}, { passive: true });
