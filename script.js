(() => {
  const body = document.body;
  const menu = document.querySelector('.menu-overlay');
  const openBtn = document.querySelector('.menu-button');
  const closeBtn = document.querySelector('.menu-close');
  const menuLinks = [...document.querySelectorAll('.overlay-nav a')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    openBtn?.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
    (open ? closeBtn : openBtn)?.focus({ preventScroll: true });
  }

  openBtn?.setAttribute('aria-expanded', 'false');
  openBtn?.setAttribute('aria-controls', 'site-menu');
  if (menu) menu.id = 'site-menu';
  openBtn?.addEventListener('click', () => setMenu(true));
  closeBtn?.addEventListener('click', () => setMenu(false));
  menuLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));

  /* Reveal on scroll */
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
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach(item => observer.observe(item));
  }

  /* Existing VIEW lens over work cards */
  const cursor = document.querySelector('.cursor');
  const mediaSurfaces = [...document.querySelectorAll('.media-wrap')];
  if (cursor && finePointer && !reducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let cursorVisible = false;
    let rafId = 0;

    const renderCursor = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${cursorVisible ? 1 : 0})`;
      rafId = requestAnimationFrame(renderCursor);
    };

    window.addEventListener('pointermove', event => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!rafId) rafId = requestAnimationFrame(renderCursor);
    }, { passive: true });

    mediaSurfaces.forEach(surface => {
      const image = surface.querySelector('img');
      if (!image) return;
      let lens = surface.querySelector('.xray-lens');
      if (!lens) {
        lens = document.createElement('span');
        lens.className = 'xray-lens';
        lens.setAttribute('aria-hidden', 'true');
        surface.appendChild(lens);
      }
      const syncLensImage = () => {
        lens.style.backgroundImage = `url("${image.currentSrc || image.src}")`;
      };
      image.complete ? syncLensImage() : image.addEventListener('load', syncLensImage, { once: true });

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

  /* Hero: slow spatial response to pointer + scroll */
  const hero = document.querySelector('.hero');
  const heroMedia = hero?.querySelector('.hero-media');
  const heroTitle = hero?.querySelector('.hero-title');
  if (hero && heroMedia && heroTitle && finePointer && !reducedMotion) {
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let scrollZoom = 1;
    let heroRaf = 0;

    const drawHero = () => {
      px += (tx - px) * 0.055;
      py += (ty - py) * 0.055;
      heroMedia.style.transform = `translate3d(${px * 10}px, ${py * 7}px, 0) scale(${1.035 * scrollZoom})`;
      heroTitle.style.transform = `translate3d(${-px * 15}px, ${-py * 8}px, 0)`;
      heroRaf = requestAnimationFrame(drawHero);
    };

    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!heroRaf) heroRaf = requestAnimationFrame(drawHero);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

    const onHeroScroll = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(hero.offsetHeight, 1)));
      scrollZoom = 1 + progress * 0.07;
      hero.style.setProperty('--hero-scroll', progress.toFixed(3));
    };
    window.addEventListener('scroll', onHeroScroll, { passive: true });
    onHeroScroll();
  }

  /* Work cards: subtle magnetic tilt and delayed entrance */
  const workCards = [...document.querySelectorAll('.work-card')];
  workCards.forEach((card, index) => card.style.setProperty('--work-index', index));
  if (finePointer && !reducedMotion) {
    workCards.forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--tilt-x', `${(-y * 1.2).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * 1.4).toFixed(2)}deg`);
        card.style.setProperty('--float-x', `${(x * 5).toFixed(1)}px`);
        card.style.setProperty('--float-y', `${(y * 4).toFixed(1)}px`);
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--float-x', '0px');
        card.style.setProperty('--float-y', '0px');
      });
    });
  }

  /* Fullscreen lightbox for every work-page gallery */
  const galleryImages = [...document.querySelectorAll('.gallery figure img')];
  if (galleryImages.length) {
    // Undo the previous "open in new tab" wrappers if they exist.
    galleryImages.forEach(image => {
      const oldLink = image.closest('a.gallery-image-link');
      if (oldLink) oldLink.replaceWith(image);
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', image.alt ? `Open image: ${image.alt}` : 'Open image');
    });

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
      <div class="lightbox-stage">
        <img class="lightbox-image" alt="">
        <div class="lightbox-caption mono"></div>
      </div>
      <div class="lightbox-ui mono">
        <span class="lightbox-count"></span>
        <button class="lightbox-close" type="button" aria-label="Close image">CLOSE ×</button>
      </div>
      <button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">←</button>
      <button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">→</button>
    `;
    body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const caption = lightbox.querySelector('.lightbox-caption');
    const count = lightbox.querySelector('.lightbox-count');
    const close = lightbox.querySelector('.lightbox-close');
    const prev = lightbox.querySelector('.lightbox-prev');
    const next = lightbox.querySelector('.lightbox-next');
    let activeIndex = 0;
    let lastFocus = null;

    const showImage = index => {
      activeIndex = (index + galleryImages.length) % galleryImages.length;
      const source = galleryImages[activeIndex];
      lightboxImage.src = source.currentSrc || source.src;
      lightboxImage.alt = source.alt || '';
      const figcaption = source.closest('figure')?.querySelector('figcaption')?.textContent?.trim();
      caption.textContent = figcaption || source.alt || '';
      count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(galleryImages.length).padStart(2, '0')}`;
    };

    const openLightbox = index => {
      lastFocus = document.activeElement;
      showImage(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      body.classList.add('lightbox-open');
      close.focus({ preventScroll: true });
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      body.classList.remove('lightbox-open');
      lastFocus?.focus?.({ preventScroll: true });
    };

    galleryImages.forEach((image, index) => {
      image.addEventListener('click', () => openLightbox(index));
      image.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    close.addEventListener('click', closeLightbox);
    prev.addEventListener('click', () => showImage(activeIndex - 1));
    next.addEventListener('click', () => showImage(activeIndex + 1));
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', event => {
      if (!lightbox.classList.contains('is-open')) {
        if (event.key === 'Escape' && menu?.classList.contains('is-open')) setMenu(false);
        return;
      }
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
      if (event.key === 'ArrowRight') showImage(activeIndex + 1);
    });
  } else {
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu?.classList.contains('is-open')) setMenu(false);
    });
  }


  /* Gallery view switch: long scroll or contact-sheet grid */
  const gallery = document.querySelector('.gallery');
  if (gallery) {
    const lang = document.documentElement.lang || 'en';
    const toolbar = document.createElement('div');
    toolbar.className = 'gallery-toolbar mono';
    toolbar.innerHTML = `
      <span class="gallery-toolbar-label">${lang.startsWith('uk') ? 'РЕЖИМ ПЕРЕГЛЯДУ' : 'VIEW MODE'}</span>
      <div class="gallery-mode-switch" role="group" aria-label="${lang.startsWith('uk') ? 'Режим галереї' : 'Gallery view mode'}">
        <button class="gallery-mode-button is-active" type="button" data-gallery-mode="scroll">SCROLL</button>
        <span class="gallery-mode-separator">/</span>
        <button class="gallery-mode-button" type="button" data-gallery-mode="grid">GRID</button>
      </div>`;
    gallery.prepend(toolbar);

    const modeButtons = [...toolbar.querySelectorAll('[data-gallery-mode]')];
    const setGalleryMode = mode => {
      gallery.classList.toggle('is-grid', mode === 'grid');
      modeButtons.forEach(button => {
        const active = button.dataset.galleryMode === mode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    };
    modeButtons.forEach(button => button.addEventListener('click', () => setGalleryMode(button.dataset.galleryMode)));
    setGalleryMode('scroll');
  }

  /* X-ray image + expanding title transition for work cards only */
  if (!reducedMotion) {
    const workLinks = [...document.querySelectorAll('a.work-card[href]')];

    const isUsableWorkLink = link => {
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return false;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return false;
      const url = new URL(link.href, window.location.href);
      return url.origin === window.location.origin && url.href !== window.location.href;
    };

    workLinks.forEach(link => {
      link.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!isUsableWorkLink(link)) return;

        const sourceImage = link.querySelector('.media-wrap img');
        const title = link.querySelector('.work-meta h3')?.textContent?.trim();
        if (!sourceImage || !title) return;

        event.preventDefault();
        const rect = sourceImage.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.className = 'cinematic-transition';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
          <img class="cinematic-transition-image" alt="">
          <div class="cinematic-transition-shade"></div>
          <div class="cinematic-transition-title">${title.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]))}</div>
          <div class="cinematic-transition-flash"></div>`;

        const clone = overlay.querySelector('.cinematic-transition-image');
        clone.src = sourceImage.currentSrc || sourceImage.src;
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.objectPosition = getComputedStyle(sourceImage).objectPosition;

        body.appendChild(overlay);
        body.classList.add('cinematic-transition-active');
        requestAnimationFrame(() => {
          overlay.classList.add('is-active');
          requestAnimationFrame(() => overlay.classList.add('is-expanded'));
        });

        window.setTimeout(() => { window.location.href = link.href; }, 790);
      });
    });

    window.addEventListener('pageshow', () => {
      body.classList.remove('cinematic-transition-active');
      document.querySelectorAll('.cinematic-transition').forEach(item => item.remove());
    });
  }

})();
