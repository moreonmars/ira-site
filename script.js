(() => {
  if (document.documentElement.dataset.iraInteractions === 'ready') return;
  document.documentElement.dataset.iraInteractions = 'ready';

  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const menu = document.querySelector('.menu-overlay');
  const menuButton = document.querySelector('.menu-button');
  const menuClose = document.querySelector('.menu-close');
  const menuLinks = [...document.querySelectorAll('.overlay-nav a')];
  menuLinks.filter(link => /^#works$/.test(link.getAttribute('href') || '')).forEach(link => { link.href = isEnglishRoute() ? '/en/works/' : '/works/'; });
  let previousFocus = null;

  function isEnglishRoute() { return document.documentElement.lang === 'en'; }

  const setMenu = open => {
    if (!menu) return;
    if (open) previousFocus = document.activeElement;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuButton?.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
    if (open) menuClose?.focus({ preventScroll: true });
    else (previousFocus || menuButton)?.focus({ preventScroll: true });
  };

  if (menu && menuButton) {
    menu.id = 'site-menu';
    menuButton.setAttribute('aria-controls', menu.id);
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', () => setMenu(true));
    menuClose?.addEventListener('click', () => setMenu(false));
    menuLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
      if (!menu.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...menu.querySelectorAll('a[href], button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* Keep the artist portfolio content actionable and current on both language versions. */
  const isEnglish = document.documentElement.lang === 'en';
  const cvPath = isEnglish ? '../assets/ira-kharlamova-cv.pdf' : 'assets/ira-kharlamova-cv.pdf';
  const aboutCopy = document.querySelector('.about-copy');
  if (aboutCopy) {
    const heading = aboutCopy.querySelector('h2');
    if (heading) heading.textContent = isEnglish
      ? 'IRA KHARLAMOVA IS A PERFORMANCE ARTIST FROM UKRAINE WORKING AT THE INTERSECTION OF EMBODIED PRACTICE, MEMORY AND COLLECTIVE ACTION.'
      : 'ІРА ХАРЛАМОВА — АРТИСТКА ПЕРФОРМАНСУ З УКРАЇНИ, ЯКА ПРАЦЮЄ НА ПЕРЕТИНІ ТІЛЕСНОЇ ПРАКТИКИ, ПАМ’ЯТІ ТА КОЛЕКТИВНОЇ ДІЇ.';
    const paragraphs = [...aboutCopy.querySelectorAll(':scope > p:not(.eyebrow)')];
    if (paragraphs[0]) paragraphs[0].textContent = isEnglish
      ? 'Her practice grows from physical theatre, live art and a long-term investigation of the body as a carrier of experience. Ira is co-founder of the NGO “Performance art of Ukraine” and founder of “ARCHIVE: performance art of Ukraine”.'
      : 'Її практика виростає з фізичного театру, live art і довготривалого дослідження тіла як носія досвіду. Іра — співзасновниця ГО «Мистецтво перформансу України» та засновниця проєкту «АРХІВ: мистецтво перформансу України»';
    const oldLink = aboutCopy.querySelector('.text-link');
    if (oldLink) {
      const actions = document.createElement('div');
      actions.className = 'about-actions';
      oldLink.href = cvPath;
      oldLink.download = '';
      oldLink.textContent = isEnglish ? 'DOWNLOAD CV ↗' : 'ЗАВАНТАЖИТИ CV ↗';
      actions.append(oldLink);
      const contact = document.createElement('a');
      contact.className = 'text-link mono';
      contact.href = 'mailto:irene.kharlamova@gmail.com';
      contact.textContent = isEnglish ? 'CONTACT IRA ↗' : 'НАПИСАТИ ІРІ ↗';
      actions.append(contact);
      aboutCopy.append(actions);
    }
  }

  const projectMeta = document.querySelector('.project-meta');
  if (projectMeta && !document.body.classList.contains('dynamic-work-page')) {
    const projectPath = window.location.pathname.toLowerCase();
    const credits = projectPath.includes('crossing-2') ? 'Oleg Samoylenko.'
      : projectPath.includes('archive-expedition') ? 'Anton Karuyk, Dmytro Laryn, Rostyslav Kuzyk.'
      : projectPath.includes('exploring-don-quixote') || projectPath.includes('zabih') ? 'Jürgen Fritz.'
      : '';
    const credit = [...projectMeta.children].find(item => /photograph|фотограф|credit|авторство/i.test(item.textContent || ''));
    const draft = [...projectMeta.children].find(item => /draft|чернет/i.test(item.textContent || ''));
    if (credit) {
      if (credits) credit.textContent = isEnglish ? `Photography: ${credits}` : `Фотографи: ${credits}`;
      else credit.remove();
    }
    draft?.remove();
    document.querySelectorAll('.gallery figure').forEach(figure => {
      const caption = figure.querySelector('figcaption');
      if (credits) {
        const creditCaption = caption || document.createElement('figcaption');
        creditCaption.textContent = isEnglish ? `Photography: ${credits}` : `Фотографи: ${credits}`;
        if (!caption) figure.append(creditCaption);
      } else {
        figure.classList.add('no-credit');
      }
    });
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

  const currentSection = document.querySelector('.current');
  const eventList = currentSection?.querySelector('.event-list');
  if (eventList && !currentSection.querySelector('.cv-actions')) {
    const cvActions = document.createElement('div');
    cvActions.className = 'cv-actions reveal visible';
    const cvLink = document.createElement('a');
    cvLink.className = 'cv-action mono';
    cvLink.href = cvPath;
    cvLink.download = '';
    cvLink.textContent = isEnglish ? 'DOWNLOAD FULL CV ↗' : 'ЗАВАНТАЖИТИ ПОВНЕ CV ↗';
    cvActions.append(cvLink);
    eventList.after(cvActions);
  }

  const homeHero = document.querySelector('.hero');
  if (homeHero && !homeHero.querySelector('.hero-actions')) {
    const heroActions = document.createElement('div');
    heroActions.className = 'hero-actions';
    const download = document.createElement('a');
    download.className = 'hero-action mono';
    download.href = cvPath;
    download.download = '';
    download.textContent = isEnglish ? 'DOWNLOAD CV' : 'ЗАВАНТАЖИТИ CV';
    const contact = document.createElement('a');
    contact.className = 'hero-action mono';
    contact.href = 'mailto:irene.kharlamova@gmail.com';
    contact.textContent = isEnglish ? 'CONTACT IRA' : 'НАПИСАТИ ІРІ';
    heroActions.append(download, contact);
    homeHero.append(heroActions);
  }

  const projectFooter = document.querySelector('.project-footer');
  if (projectFooter) {
    const projects = [
      ['archive-expedition', 'ARCHIVE: EXPEDITION'],
      ['crossing-2', 'CROSSING 2.0'],
      ['exploring-don-quixote', 'EXPLORING DON QUIXOTE'],
      ['zabih', 'JÜRGEN FRITZ WORKSHOP / ZABIH'],
      ['shards-of-normality', 'SHARDS OF NORMALITY'],
      ['performance-platform-lublin', 'BORDER']
    ];
    const slug = window.location.pathname.split('/').pop()?.replace(/\.html$/, '');
    const currentProject = projects.findIndex(([projectSlug]) => projectSlug === slug);
    if (currentProject >= 0) {
      const isEnglishPage = document.documentElement.lang === 'en';
      const makeProjectLink = (label, project) => {
        const item = document.createElement('div');
        item.className = 'project-nav-item';
        const eyebrow = document.createElement('span');
        eyebrow.className = 'mono';
        eyebrow.textContent = label;
        const link = document.createElement('a');
        link.href = `${project[0]}.html`;
        link.textContent = `${project[1]} ↗`;
        link.setAttribute('aria-label', `${label}: ${project[1]}`);
        item.append(eyebrow, link);
        return item;
      };
      const previous = projects[(currentProject - 1 + projects.length) % projects.length];
      const next = projects[(currentProject + 1) % projects.length];
      const navigation = document.createElement('div');
      navigation.className = 'project-nav';
      navigation.append(
        makeProjectLink(isEnglishPage ? 'PREVIOUS WORK' : 'ПОПЕРЕДНЯ РОБОТА', previous),
        makeProjectLink(isEnglishPage ? 'NEXT WORK' : 'НАСТУПНА РОБОТА', next)
      );
      projectFooter.replaceChildren(navigation);
    }
  }

  /* Replace the ↗ text glyph with one consistent drawn arrow.
     This prevents iOS from rendering it as a blue emoji. */
  const makeInlineArrow = () => {
    const arrow = document.createElement('span');
    arrow.className = 'inline-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    return arrow;
  };
  document.querySelectorAll('.event[href] > span:last-child').forEach(element => {
    if (element.textContent.trim() !== '↗') return;
    element.textContent = '';
    element.appendChild(makeInlineArrow());
  });
  document.querySelectorAll('.text-link, .footer-links a, .menu-foot a, .project-footer a').forEach(link => {
    if (link.querySelector('.inline-arrow')) return;
    const textNode = [...link.childNodes].reverse().find(node =>
      node.nodeType === Node.TEXT_NODE && /↗\s*$/.test(node.textContent || '')
    );
    if (!textNode) return;
    textNode.textContent = (textNode.textContent || '').replace(/\s*↗\s*$/, '');
    link.appendChild(makeInlineArrow());
  });

  /* Persistent arrow: quiet by default, stronger over any interactive element. */
  let siteArrowCursor = null;
  if (finePointer && !reducedMotion) {
    siteArrowCursor = document.createElement('div');
    siteArrowCursor.className = 'site-arrow-cursor';
    siteArrowCursor.setAttribute('aria-hidden', 'true');
    siteArrowCursor.innerHTML = `
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path class="arrow-shadow" d="M6 34 33 7M17 7h16v16" fill="none" stroke="#7b1547" stroke-width="6" stroke-linecap="square" stroke-linejoin="miter" transform="translate(2 2)" opacity=".8"/>
        <path class="arrow-main" d="M6 34 33 7M17 7h16v16" fill="none" stroke="#ff5cad" stroke-width="4.5" stroke-linecap="square" stroke-linejoin="miter"/>
      </svg>`;
    body.appendChild(siteArrowCursor);
    document.documentElement.classList.add('has-arrow-cursor');

    let targetX = -100;
    let targetY = -100;
    let currentX = targetX;
    let currentY = targetY;
    let arrowFrame = 0;
    const drawArrow = () => {
      currentX += (targetX - currentX) * 0.32;
      currentY += (targetY - currentY) * 0.32;
      siteArrowCursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      arrowFrame = requestAnimationFrame(drawArrow);
    };
    const setArrowState = target => {
      const element = target instanceof Element ? target : null;
      const overMedia = Boolean(element?.closest('.media-wrap'));
      const interactive = Boolean(element?.closest('a[href], button, [role="button"], .gallery figure img'));
      const onPink = Boolean(element?.closest('.manifesto, .ticker, .footer, .menu-overlay, .project-footer'));
      siteArrowCursor.classList.toggle('is-over-media', overMedia);
      siteArrowCursor.classList.toggle('is-active', interactive);
      siteArrowCursor.classList.toggle('is-on-pink', onPink && !overMedia);
    };
    window.addEventListener('pointermove', event => {
      targetX = event.clientX;
      targetY = event.clientY;
      siteArrowCursor.classList.add('is-visible');
      setArrowState(event.target);
      if (!arrowFrame) arrowFrame = requestAnimationFrame(drawArrow);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => siteArrowCursor.classList.remove('is-visible'));
    document.documentElement.addEventListener('pointerenter', () => siteArrowCursor.classList.add('is-visible'));
  }

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
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', document.documentElement.lang.startsWith('uk') ? 'Перегляд зображення' : 'Image viewer');
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
    const lightboxStage = lightbox.querySelector('.lightbox-stage');
    let currentImage = 0;
    let lastFocus = null;
    let touchStartX = 0;
    let touchStartY = 0;

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
    lightboxStage.addEventListener('touchstart', event => {
      const [touch] = event.touches;
      touchStartX = touch?.clientX || 0;
      touchStartY = touch?.clientY || 0;
    }, { passive: true });
    lightboxStage.addEventListener('touchend', event => {
      const [touch] = event.changedTouches;
      const deltaX = (touch?.clientX || 0) - touchStartX;
      const deltaY = (touch?.clientY || 0) - touchStartY;
      if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
      if (deltaX < 0) showImage(currentImage + 1);
      else showImage(currentImage - 1);
    }, { passive: true });
    lightbox.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const focusable = [closeButton, previousButton, nextButton];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
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
          <button class="gallery-mode-button is-active" type="button" data-gallery-mode="scroll">${isUkrainian ? 'СПИСОК' : 'SCROLL'}</button>
          <span class="gallery-mode-separator">/</span>
          <button class="gallery-mode-button" type="button" data-gallery-mode="grid">${isUkrainian ? 'СІТКА' : 'GRID'}</button>
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

  /* Project transition: cards, CV rows and NEXT WORK all use the same x-ray handoff. */
  if (!reducedMotion && finePointer) {
    const canTransition = link => {
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return false;
      const url = new URL(link.href, window.location.href);
      return url.origin === window.location.origin && url.href !== window.location.href;
    };

    const imageByWork = {
      'archive-expedition.html': 'archive-kyiv-01.webp',
      'crossing-2.html': 'crossing-01.webp',
      'exploring-don-quixote.html': 'don-quixote-01.webp',
      'zabih.html': 'zabih-01.webp',
      'shards-of-normality.html': 'shards-01.webp',
      'performance-platform-lublin.html': 'border-01.webp',
    };
    const imageForLink = link => {
      const localImage = link.querySelector('.media-wrap img');
      if (localImage) return localImage;
      const fileName = new URL(link.href, window.location.href).pathname.split('/').pop();
      const assetName = imageByWork[fileName];
      if (assetName) {
        const image = new Image();
        image.src = new URL(`/assets/${assetName}`, window.location.origin).href;
        return image;
      }
      const projectImage = document.querySelector('.project-hero-media');
      return projectImage && link.closest('.project-footer') ? projectImage : null;
    };
    const titleForLink = link =>
      link.querySelector('.work-meta h3, .event-title') ||
      (link.closest('.project-footer') ? link : null);

    /* Normal navigation keeps the card arrow visible and avoids a full-screen
       overlay that can look like a square shadow on hover. */
    const transitionLinks = [];

    transitionLinks.forEach(link => {
      link.addEventListener('click', event => {
        const nonPrimaryClick = typeof event.button === 'number' && event.button !== 0;
        if (event.defaultPrevented || nonPrimaryClick || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !canTransition(link)) return;
        const image = imageForLink(link);
        const titleElement = titleForLink(link);
        const title = titleElement?.textContent?.trim();
        if (!image || !title || !titleElement) return;

        event.preventDefault();
        const measuredImageRect = image.getBoundingClientRect();
        const imageRect = measuredImageRect.width && measuredImageRect.height
          ? measuredImageRect
          : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const titleRect = titleElement.getBoundingClientRect();
        const titleStyles = getComputedStyle(titleElement);
        const overlay = document.createElement('div');
        overlay.className = 'project-transition';
        overlay.setAttribute('aria-hidden', 'true');
        const transitionImage = document.createElement('img');
        transitionImage.className = 'project-transition-image';
        transitionImage.alt = '';
        transitionImage.decoding = 'sync';
        transitionImage.src = image.currentSrc || image.src;
        transitionImage.style.left = `${imageRect.left}px`;
        transitionImage.style.top = `${imageRect.top}px`;
        transitionImage.style.width = `${imageRect.width}px`;
        transitionImage.style.height = `${imageRect.height}px`;
        transitionImage.style.objectPosition = getComputedStyle(image).objectPosition;
        const shade = document.createElement('div');
        shade.className = 'project-transition-shade';
        const transitionTitle = document.createElement('div');
        transitionTitle.className = 'project-transition-title';
        transitionTitle.textContent = title;
        Object.assign(transitionTitle.style, {
          left: `${titleRect.left}px`,
          top: `${titleRect.top}px`,
          width: `${titleRect.width}px`,
          fontSize: titleStyles.fontSize,
          lineHeight: titleStyles.lineHeight,
          letterSpacing: titleStyles.letterSpacing,
          color: titleStyles.color,
        });
        overlay.append(transitionImage, shade, transitionTitle);
        body.appendChild(overlay);
        body.classList.add('is-transitioning');
        overlay.classList.add('is-active');

        const isMobile = window.innerWidth <= 760;
        const horizontalInset = isMobile ? 16 : window.innerWidth * 0.025;
        const bottomInset = window.innerHeight * (isMobile ? 0.05 : 0.04);
        const finalWidth = window.innerWidth - horizontalInset * 2;
        const finalFontSize = isMobile
          ? Math.min(72, Math.max(46, window.innerWidth * 0.14))
          : Math.min(190, Math.max(56, window.innerWidth * 0.11));
        const titleMeasure = transitionTitle.cloneNode(true);
        Object.assign(titleMeasure.style, {
          visibility: 'hidden',
          left: `${horizontalInset}px`,
          top: '-10000px',
          width: `${finalWidth}px`,
          fontSize: `${finalFontSize}px`,
          lineHeight: isMobile ? '0.8' : '0.76',
          letterSpacing: '-0.075em',
        });
        body.appendChild(titleMeasure);
        const finalHeight = titleMeasure.getBoundingClientRect().height;
        titleMeasure.remove();
        const finalTop = window.innerHeight - bottomInset - finalHeight;

        /* Force the initial card geometry to paint before expansion.
           This is important on touch Safari, where two nested frames may be collapsed. */
        overlay.getBoundingClientRect();
        requestAnimationFrame(() => {
          overlay.classList.add('is-expanded');
          Object.assign(transitionTitle.style, {
            left: `${horizontalInset}px`,
            top: `${finalTop}px`,
            width: `${finalWidth}px`,
            fontSize: `${finalFontSize}px`,
            lineHeight: isMobile ? '0.8' : '0.76',
            letterSpacing: '-0.075em',
            color: 'var(--pink)',
          });
        });
        window.setTimeout(() => {
          window.location.assign(link.href);
        }, isMobile ? 860 : 700);
      });
    });
  }

  const loadPublishedContent = async () => {
    try {
      const response = await fetch('/content.json', { cache: 'no-store' });
      if (!response.ok) return;
      const content = await response.json();
      const isEnglishContent = document.documentElement.lang === 'en';
      const language = isEnglishContent ? 'en' : 'uk';
      const homeGrid = document.querySelector('.works .work-grid');
      if (homeGrid && Array.isArray(content.works)) {
        const featuredOrder = ['archive-expedition', 'crossing-2', 'exploring-don-quixote', 'zabih', 'shards-of-normality', 'performance-platform-lublin'];
        const publishedWorks = content.works.filter(item => item.status !== 'draft');
        const publishedById = new Map(publishedWorks.map(item => [item.id, item]));
        const newWorks = publishedWorks.filter(item => !featuredOrder.includes(item.id));
        const homeWorks = [...newWorks, ...featuredOrder.map(id => publishedById.get(id)).filter(Boolean)];
        const legacyPages = { 'archive-expedition': 'archive-expedition', 'crossing-2': 'crossing-2', 'exploring-don-quixote': 'exploring-don-quixote', zabih: 'zabih', 'shards-of-normality': 'shards-of-normality', 'performance-platform-lublin': 'performance-platform-lublin' };
        const resolveAsset = source => source?.startsWith('http') ? source : `${isEnglishContent ? '../' : ''}${String(source || '').replace(/^\.\//, '')}`;
        homeGrid.replaceChildren(...homeWorks.map((work, index) => {
          const title = work.title?.[language] || work.title?.uk || '';
          const location = work.location?.[language] || work.location?.uk || '';
          const card = document.createElement('a');
          card.className = `work-card work-card--${['wide', 'portrait', 'landscape'][index % 3]} reveal visible`;
          card.href = legacyPages[work.id] ? `${isEnglishContent ? '../' : ''}works/${legacyPages[work.id]}.html` : `${isEnglishContent ? '../' : ''}work.html?id=${encodeURIComponent(work.id)}`;
          card.innerHTML = `<div class="media-wrap"><img src="${resolveAsset(work.cover)}" alt="${title}" loading="lazy" decoding="async"></div><div class="work-meta"><span class="mono">${String(index + 1).padStart(2, '0')} / ${work.year || ''}${location ? ` / ${location}` : ''}</span><h3>${title}</h3></div>`;
          return card;
        }));
      }
      const profile = content.profile;
      if (profile) {
        const about = document.querySelector('.about-copy');
        const profileCv = profile.cv?.startsWith('http') ? profile.cv : `${isEnglishContent ? '../' : ''}${String(profile.cv || '').replace(/^\.\//, '')}`;
        const profilePortrait = profile.portrait?.startsWith('http') ? profile.portrait : `${isEnglishContent ? '../' : ''}${String(profile.portrait || '').replace(/^\.\//, '')}`;
        const portrait = document.querySelector('.about-image img');
        if (portrait && profilePortrait) portrait.src = profilePortrait;
        const aboutHeading = about?.querySelector('h2');
        if (profile.heading?.[language] && aboutHeading) aboutHeading.textContent = profile.heading[language];
        const paragraphs = [...(about?.querySelectorAll(':scope > p:not(.eyebrow)') || [])];
        profile.paragraphs?.[language]?.forEach((text, index) => { if (paragraphs[index]) paragraphs[index].textContent = text; });
        const cvLink = about?.querySelector('.about-actions .text-link');
        if (cvLink && profileCv) { cvLink.href = profileCv; }
        const contactLinks = [...document.querySelectorAll('.about-actions .text-link, .hero-actions a, .footer-links a')].filter(link => /CV|CONTACT|НАПИСАТИ|ЗАПИТАТИ|EMAIL|GMAIL/i.test(link.textContent || ''));
        contactLinks.forEach(link => { if (link.href.startsWith('mailto:')) link.href = `mailto:${profile.email || 'irene.kharlamova@gmail.com'}`; });
        document.querySelectorAll('.footer-links a').forEach(link => { if (/instagram/i.test(link.textContent || '')) link.href = profile.instagram || link.href; });
        document.querySelectorAll('.hero-actions a').forEach(link => { if (/CONTACT|НАПИСАТИ/i.test(link.textContent || '')) link.href = `mailto:${profile.email || 'irene.kharlamova@gmail.com'}`; if (/DOWNLOAD|ЗАВАНТАЖИТИ/i.test(link.textContent || '') && profileCv) link.href = profileCv; });
      }
      const slug = window.location.pathname.split('/').pop()?.replace(/\.html$/, '');
      const work = content.works?.find(item => item.id === slug);
      if (!work || work.status === 'draft') return;
      const title = work.title?.[language];
      const description = work.description?.[language];
      const photographer = work.photographer?.[language]?.trim();
      const image = work.cover?.startsWith('http') ? work.cover : new URL(String(work.cover || '').replace(/^\.\.\//, ''), window.location.origin + (isEnglishContent ? '/en/' : '/')).href;
      const setMeta = (selector, value, attribute = 'content') => { const meta = document.querySelector(selector); if (meta && value) meta.setAttribute(attribute, value); };
      if (title) {
        document.title = `${title} — Ira Kharlamova`;
        setMeta('meta[name="description"]', description);
        setMeta('meta[property="og:title"]', `${title} — Ira Kharlamova`);
        setMeta('meta[property="og:description"]', description);
        setMeta('meta[property="og:image"]', image);
        setMeta('meta[property="og:image:alt"]', `${title} — Ira Kharlamova`);
        setMeta('meta[name="twitter:title"]', `${title} — Ira Kharlamova`);
        setMeta('meta[name="twitter:description"]', description);
        setMeta('meta[name="twitter:image"]', image);
      }
      const projectTitle = document.querySelector('.project-title');
      const projectDescription = document.querySelector('.project-info > p');
      if (title && projectTitle) projectTitle.textContent = title;
      if (description && projectDescription) projectDescription.textContent = description;
      if (photographer) {
        const projectMetaContent = document.querySelector('.project-meta');
        const existingCredit = [...(projectMetaContent?.children || [])].find(item => /photograph|фотограф/i.test(item.textContent || ''));
        const creditText = isEnglishContent ? `Photography: ${photographer}` : `Фотограф: ${photographer}`;
        if (existingCredit) existingCredit.textContent = creditText;
        else if (projectMetaContent) { const credit = document.createElement('span'); credit.textContent = creditText; projectMetaContent.append(credit); }
        document.querySelectorAll('.gallery figure').forEach(figure => { const caption = figure.querySelector('figcaption') || document.createElement('figcaption'); caption.textContent = creditText; if (!caption.parentElement) figure.append(caption); });
      }
      const gallerySources = typeof work.gallery === 'string' ? work.gallery.split(/\r?\n/).map(source => source.trim()).filter(Boolean) : [];
      const liveGallery = document.querySelector('.gallery');
      if (gallerySources.length && liveGallery) {
        const figures = [...liveGallery.querySelectorAll('figure')];
        gallerySources.forEach((source, index) => {
          const figure = figures[index] || document.createElement('figure');
          if (!figure.parentElement) liveGallery.append(figure);
          const image = figure.querySelector('img') || document.createElement('img');
          image.src = source; image.alt = title || ''; image.loading = index === 0 ? 'eager' : 'lazy'; image.decoding = 'async';
          if (!image.parentElement) figure.append(image);
          if (photographer) { const caption = figure.querySelector('figcaption') || document.createElement('figcaption'); caption.textContent = isEnglishContent ? `Photography: ${photographer}` : `Фотограф: ${photographer}`; if (!caption.parentElement) figure.append(caption); }
        });
        figures.slice(gallerySources.length).forEach(figure => figure.remove());
      }
      document.querySelectorAll('.work-card[href]').forEach(card => { if (!card.getAttribute('href')?.includes(`${work.id}.html`)) return; const cardTitle = card.querySelector('h3'); if (title && cardTitle) cardTitle.textContent = title; });
    } catch { /* The static HTML remains the fallback when content is unavailable. */ }
  };
  loadPublishedContent();

  window.addEventListener('pageshow', () => {
    body.classList.remove('is-transitioning');
    document.querySelectorAll('.project-transition').forEach(transition => transition.remove());
  });
})();
