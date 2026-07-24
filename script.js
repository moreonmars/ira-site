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
  const mediaSurfaces = [...document.querySelectorAll('.media-wrap')];

  if (cursor && finePointer && !reducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let cursorVisible = false;
    let rafId = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.24;
      currentY += (targetY - currentY) * 0.24;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${cursorVisible ? 1 : 0})`;
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', event => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!rafId) rafId = requestAnimationFrame(render);
    }, { passive: true });

    mediaSurfaces.forEach(surface => {
      const image = surface.querySelector('img');
      if (!image) return;

      const lens = document.createElement('span');
      lens.className = 'xray-lens';
      lens.setAttribute('aria-hidden', 'true');
      lens.style.backgroundImage = `url("${image.currentSrc || image.src}")`;
      surface.appendChild(lens);

      const updateLens = event => {
        const rect = surface.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        lens.style.left = `${x}px`;
        lens.style.top = `${y}px`;
        lens.style.backgroundSize = `${image.clientWidth}px ${image.clientHeight}px`;
        lens.style.backgroundPosition = `${-x + 66}px ${-y + 66}px`;
      };

      surface.addEventListener('pointerenter', event => {
        cursorVisible = true;
        cursor.classList.add('visible');
        cursor.querySelector('span').textContent = 'VIEW';
        body.classList.add('custom-cursor-active');
        surface.classList.add('is-lens-active');
        updateLens(event);
      });
      surface.addEventListener('pointermove', updateLens, { passive: true });
      surface.addEventListener('pointerleave', () => {
        cursorVisible = false;
        cursor.classList.remove('visible');
        body.classList.remove('custom-cursor-active');
        surface.classList.remove('is-lens-active');
      });
    });
  } else {
    cursor?.remove();
  }

  document.querySelectorAll('.event').forEach((event, index) => {
    event.style.setProperty('--event-index', index);
  });

  // Every work-page gallery image opens its original file in a new tab.
  document.querySelectorAll('.gallery figure img').forEach(image => {
    if (image.closest('a.gallery-image-link')) return;
    const link = document.createElement('a');
    link.className = 'gallery-image-link';
    link.href = image.currentSrc || image.src;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', image.alt ? `Open full-size image: ${image.alt}` : 'Open full-size image');
    image.parentNode.insertBefore(link, image);
    link.appendChild(image);
  });
})();
