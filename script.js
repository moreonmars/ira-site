(() => {
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const menu = document.querySelector('.menu-overlay');
  const menuButton = document.querySelector('.menu-button');
  const menuClose = document.querySelector('.menu-close');
  const menuLinks = [...document.querySelectorAll('.overlay-nav a')];

  const setMenu = open => {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuButton?.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
    (open ? menuClose : menuButton)?.focus({ preventScroll: true });
  };

  if (menu && menuButton) {
    menu.id = 'site-menu';
    menuButton.setAttribute('aria-controls', menu.id);
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', () => setMenu(true));
    menuClose?.addEventListener('click', () => setMenu(false));
    menuLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
  }

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

  document.querySelectorAll('.event').forEach((event, index) => {
    event.style.setProperty('--event-index', index);
  });

  /* VIEW lens: used only over image cards. */
  const viewCursor = document.querySelector('.cursor');
  const mediaSurfaces = [...document.querySelectorAll('.media-wrap')];
  if (viewCursor && finePointer && !reducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isVisible = false;
    let cursorFrame = 0;

    const drawCursor = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      viewCursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${isVisible ? 1 : 0})`;
      cursorFrame = requestAnimationFrame(drawCursor);
    };

    window.addEventListener('pointermove', event => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!cursorFrame) cursorFrame = requestAnimationFrame(drawCursor);
    }, { passive: true });

    mediaSurfaces.forEach(surface => {
      const image = surface.querySelector('img');
      if (!image) return;

      const lens = document.createElement('span');
      lens.className = 'xray-lens';
      lens.setAttribute('aria-hidden', 'true');
      surface.appendChild(lens);

      const syncLens = () => {
        lens.style.backgroundImage = `url("${image.currentSrc || image.src}")`;
      };
      image.complete ? syncLens() : image.addEventListener('load', syncLens, { once: true });

      const updateLens = event => {
        const rect = surface.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const naturalWidth = image.naturalWidth || image.clientWidth;
        const naturalHeight = image.naturalHeight || image.clientHeight;
        const scale = Math.max(rect.width / naturalWidth, rect.height / naturalHeight);
        const renderedWidth = naturalWidth * scale;
        const renderedHeight = naturalHeight * scale;
        const offsetX = (rect.width - renderedWidth) / 2;
        const offsetY = (rect.height - renderedHeight) / 2;
        const lensRadius = 66;

        lens.style.left = `${x}px`;
        lens.style.top = `${y}px`;
        lens.style.backgroundSize = `${renderedWidth}px ${renderedHeight}px`;
        lens.style.backgroundPosition = `${offsetX - x + lensRadius}px ${offsetY - y + lensRadius}px`;
      };

      surface.addEventListener('pointerenter', event => {
        isVisible = true;
        viewCursor.classList.add('visible');
        body.classList.add('custom-cursor-active');
        surface.classList.add('is-lens-active');
        updateLens(event);
      });
      surface.addEventListener('pointermove', updateLens, { passive: true });
      surface.addEventListener('pointerleave', () => {
        isVisible = false;
        viewCursor.classList.remove('visible');
        body.classList.remove('custom-cursor-active');
        surface.classList.remove('is-lens-active');
      });
    });
  } else {
    viewCursor?.remove();
  }

  /* Hero moves subtly against the title. */
  const hero = document.querySelector('.hero');
  const heroMedia = hero?.querySelector('.hero-media');
  const heroTitle = hero?.querySelector('.hero-title');
  if (hero && heroMedia && heroTitle && finePointer && !reducedMotion) {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let zoom = 1;
    let frame = 0;

    const drawHero = () => {
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;
      heroMedia.style.transform = `translate3d(${currentX * 10}px, ${currentY * 7}px, 0) scale(${1.035 * zoom})`;
      heroTitle.style.transform = `translate3d(${-currentX * 15}px, ${-currentY * 8}px, 0)`;
      frame = requestAnimationFrame(drawHero);
    };

    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(drawHero);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
    const updateHeroScroll = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(hero.offsetHeight, 1)));
      zoom = 1 + progress * 0.07;
      hero.style.setProperty('--hero-scroll', progress.toFixed(3));
    };
    window.addEventListener('scroll', updateHeroScroll, { passive: true });
    updateHeroScroll();
  }

  /* Work cards retain their light spatial response without affecting text hover. */
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

  /* Gallery: fullscreen images plus a scroll/grid switch. */
  const gallery = document.querySelector('.gallery');
  const galleryImages = [...document.querySelectorAll('.gallery figure img')];
  let lightbox = null;
  let closeLightbox = null;

  if (galleryImages.length) {
    galleryImages.forEach(image => {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', image.alt ? `Open image: ${image.alt}` : 'Open image');
    });

    lightbox = document.createElement('div');
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
      <button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">→</button>`;
    body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const caption = lightbox.querySelector('.lightbox-caption');
    const counter = lightbox.querySelector('.lightbox-count');
    const closeButton = lightbox.querySelector('.lightbox-close');
    const previousButton = lightbox.querySelector('.lightbox-prev');
    const nextButton = lightbox.querySelector('.lightbox-next');
    let currentImage = 0;
    let lastFocus = null;

    const showImage = index => {
      currentImage = (index + galleryImages.length) % galleryImages.length;
      const source = galleryImages[currentImage];
      lightboxImage.src = source.currentSrc || source.src;
      lightboxImage.alt = source.alt || '';
      caption.textContent = source.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || source.alt || '';
      counter.textContent = `${String(currentImage + 1).padStart(2, '0')} / ${String(galleryImages.length).padStart(2, '0')}`;
    };
    const openLightbox = index => {
      lastFocus = document.activeElement;
      showImage(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      body.classList.add('lightbox-open');
      closeButton.focus({ preventScroll: true });
    };
    closeLightbox = () => {
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
    closeButton.addEventListener('click', closeLightbox);
    previousButton.addEventListener('click', () => showImage(currentImage - 1));
    nextButton.addEventListener('click', () => showImage(currentImage + 1));
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) closeLightbox();
    });

    if (gallery) {
      const isUkrainian = document.documentElement.lang.startsWith('uk');
      const toolbar = document.createElement('div');
      toolbar.className = 'gallery-toolbar mono';
      toolbar.innerHTML = `
        <span class="gallery-toolbar-label">${isUkrainian ? 'РЕЖИМ ПЕРЕГЛЯДУ' : 'VIEW MODE'}</span>
        <div class="gallery-mode-switch" role="group" aria-label="${isUkrainian ? 'Режим галереї' : 'Gallery view mode'}">
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
  }

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') {
      if (lightbox?.classList.contains('is-open')) {
        if (event.key === 'ArrowLeft') lightbox.querySelector('.lightbox-prev')?.click();
        if (event.key === 'ArrowRight') lightbox.querySelector('.lightbox-next')?.click();
      }
      return;
    }
    if (lightbox?.classList.contains('is-open')) closeLightbox?.();
    else if (menu?.classList.contains('is-open')) setMenu(false);
  });

  /* Project transition: one x-ray image expands, then the title takes the frame. */
  if (!reducedMotion) {
    const canTransition = link => {
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return false;
      const url = new URL(link.href, window.location.href);
      return url.origin === window.location.origin && url.href !== window.location.href;
    };

    workCards.forEach(link => {
      link.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !canTransition(link)) return;
        const image = link.querySelector('.media-wrap img');
        const title = link.querySelector('.work-meta h3')?.textContent?.trim();
        if (!image || !title) return;

        event.preventDefault();
        const rect = image.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.className = 'project-transition';
        overlay.setAttribute('aria-hidden', 'true');
        const transitionImage = document.createElement('img');
        transitionImage.className = 'project-transition-image';
        transitionImage.alt = '';
        transitionImage.src = image.currentSrc || image.src;
        transitionImage.style.left = `${rect.left}px`;
        transitionImage.style.top = `${rect.top}px`;
        transitionImage.style.width = `${rect.width}px`;
        transitionImage.style.height = `${rect.height}px`;
        transitionImage.style.objectPosition = getComputedStyle(image).objectPosition;
        const shade = document.createElement('div');
        shade.className = 'project-transition-shade';
        const transitionTitle = document.createElement('div');
        transitionTitle.className = 'project-transition-title';
        transitionTitle.textContent = title;
        overlay.append(transitionImage, shade, transitionTitle);
        body.appendChild(overlay);
        body.classList.add('is-transitioning');

        requestAnimationFrame(() => {
          overlay.classList.add('is-active');
          requestAnimationFrame(() => overlay.classList.add('is-expanded'));
        });
        window.setTimeout(() => { window.location.assign(link.href); }, 700);
      });
    });
  }
})();
