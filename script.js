(() => {
  const body = document.body;
  const menu = document.querySelector('.menu-overlay');
  const openBtn = document.querySelector('.menu-button');
  const closeBtn = document.querySelector('.menu-close');
  const menuLinks = [...document.querySelectorAll('.overlay-nav a')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    openBtn?.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);

    if (open) {
      closeBtn?.focus({ preventScroll: true });
    } else {
      openBtn?.focus({ preventScroll: true });
    }
  }

  openBtn?.setAttribute('aria-expanded', 'false');
  openBtn?.setAttribute('aria-controls', 'site-menu');
  if (menu) menu.id = 'site-menu';
  openBtn?.addEventListener('click', () => setMenu(true));
  closeBtn?.addEventListener('click', () => setMenu(false));
  menuLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.classList.contains('is-open')) setMenu(false);
  });

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach(item => observer.observe(item));
  }

  const cursor = document.querySelector('.cursor');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (cursor && finePointer && !reducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${cursor.classList.contains('visible') ? 1 : 0})`;
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', event => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!rafId) rafId = requestAnimationFrame(render);
    }, { passive: true });

    document.querySelectorAll('[data-cursor], .magnetic').forEach(element => {
      element.addEventListener('pointerenter', () => {
        cursor.querySelector('span').textContent = element.dataset.cursor || 'VIEW';
        cursor.classList.add('visible');
        body.classList.add('custom-cursor-active');
      });
      element.addEventListener('pointerleave', () => {
        cursor.classList.remove('visible');
        body.classList.remove('custom-cursor-active');
      });
    });
  } else {
    cursor?.remove();
  }

  document.querySelectorAll('.event').forEach((event, index) => {
    event.style.setProperty('--event-index', index);
  });
})();
