(() => {
  const root = document.querySelector('#dynamic-work');
  if (!root) return;
  const english = document.documentElement.lang === 'en';
  const id = new URLSearchParams(window.location.search).get('id');
  const language = english ? 'en' : 'uk';
  const assetUrl = source => source?.startsWith('http') ? source : new URL(String(source || '').replace(/^(\.\.\/)+/, ''), window.location.origin + '/').href;
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const workTitle = item => item?.title?.[language] || item?.title?.uk || '';
  const workHref = item => `${english ? '/en/work.html' : '/work.html'}?id=${encodeURIComponent(item.id)}`;

  fetch('/content.json', { cache: 'no-store' }).then(response => response.json()).then(content => {
    const works = (content.works || []).filter(item => item.status !== 'draft');
    const work = works.find(item => item.id === id);
    if (!work) {
      root.innerHTML = `<section class="error-content"><p class="eyebrow mono">404</p><h1>${english ? 'Work not found.' : 'Роботу не знайдено.'}</h1><a class="text-link mono" href="${english ? '/en/works/' : '/works/'}">${english ? '← All works' : '← Всі роботи'}</a></section>`;
      return;
    }

    const title = workTitle(work);
    const location = work.location?.[language] || work.location?.uk || '';
    const description = work.description?.[language] || work.description?.uk || '';
    const photographer = work.photographer?.[language] || work.photographer?.uk || '';
    const gallery = String(work.gallery || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean);
    const galleryCredits = String(work.galleryCredits || '').split(/\r?\n/).map(item => item.trim());
    const currentIndex = works.findIndex(item => item.id === work.id);
    const previous = currentIndex > 0 ? works[currentIndex - 1] : null;
    const next = currentIndex < works.length - 1 ? works[currentIndex + 1] : null;
    const previousLabel = english ? 'PREVIOUS' : 'ПОПЕРЕДНЯ';
    const nextLabel = english ? 'NEXT' : 'НАСТУПНА';
    const archiveLabel = english ? 'ALL WORKS' : 'ВСІ РОБОТИ';
    const navigation = `<nav class="project-nav mono" aria-label="${english ? 'Work navigation' : 'Навігація роботами'}"><a class="project-nav-item project-nav-prev${previous ? '' : ' is-empty'}" href="${previous ? workHref(previous) : '#'}"${previous ? '' : ' aria-hidden="true" tabindex="-1"'}><span>${previousLabel}</span><strong>${previous ? `${esc(workTitle(previous))} ↖` : ''}</strong></a><a class="project-nav-item project-nav-archive" href="${english ? '/en/works/' : '/works/'}"><span>${archiveLabel}</span><strong>${english ? 'BACK TO ARCHIVE ↗' : 'ДО АРХІВУ ↗'}</strong></a><a class="project-nav-item project-nav-next${next ? '' : ' is-empty'}" href="${next ? workHref(next) : '#'}"${next ? '' : ' aria-hidden="true" tabindex="-1"'}><span>${nextLabel}</span><strong>${next ? `${esc(workTitle(next))} ↗` : ''}</strong></a></nav>`;

    document.title = `${title} — Ira Kharlamova`;
    let authorMeta = document.querySelector('meta[name="author"]');
    if (!authorMeta) { authorMeta = document.createElement('meta'); authorMeta.name = 'author'; document.head.append(authorMeta); }
    authorMeta.content = photographer;
    root.innerHTML = `<a class="back-link" href="${english ? '/en/works/' : '/works/'}">← ${archiveLabel}</a><header class="site-header"><a class="wordmark" href="${english ? '/en/' : '/'}"><img class="wordmark-icon" src="/ira-logo.png" alt="" aria-hidden="true"><span class="wordmark-label">IRA<br>KHARLAMOVA</span></a><div class="header-meta"><span>${esc(work.year)}</span><span>${esc(location)}</span></div><div class="header-actions"><a class="language" href="${english ? `/work.html?id=${encodeURIComponent(work.id)}` : `/en/work.html?id=${encodeURIComponent(work.id)}`}">${english ? 'EN / UA' : 'UA / EN'}</a><button type="button" class="menu-button">MENU</button></div></header><main><section class="project-hero"><img class="project-hero-media" src="${assetUrl(work.cover)}" alt="${esc(title)}" fetchpriority="high"><div class="project-hero-shade"></div><div class="project-hero-content"><span class="project-kicker mono">${esc(work.year)} / ${esc(location)}</span><h1 class="project-title">${esc(title)}</h1></div></section><section class="project-details"><div class="project-info"><p>${esc(description)}</p><div class="project-meta mono"><span>IRA KHARLAMOVA</span>${photographer ? `<span>${english ? 'Photography' : 'Фотограф'}: ${esc(photographer)}</span>` : ''}</div></div></section><section class="gallery">${gallery.map((source, index) => { const credit = galleryCredits[index] || ''; const creditLabel = credit ? `<figcaption>${english ? 'Photography' : 'Фотограф'}: ${esc(credit)}</figcaption>` : ''; return `<figure class="reveal" data-photographer="${esc(credit || photographer)}"><img src="${assetUrl(source)}" alt="${esc(title)}" data-photographer="${esc(credit || photographer)}" loading="lazy" decoding="async">${creditLabel}</figure>`; }).join('')}</section><section class="project-footer">${navigation}</section></main><div class="menu-overlay" aria-hidden="true"><div class="menu-top mono"><span>INDEX</span><button class="menu-close">${english ? 'CLOSE ×' : 'ЗАКРИТИ ×'}</button></div><nav class="overlay-nav"><a href="${english ? '/en/works/' : '/works/'}">${english ? 'WORKS' : 'РОБОТИ'}</a><a href="${english ? '/en/#about' : '/#about'}">${english ? 'ABOUT' : 'ПРО МЕНЕ'}</a><a href="${english ? '/en/#current' : '/#current'}">CV</a><a href="${english ? '/en/#contact' : '/#contact'}">${english ? 'CONTACT' : 'КОНТАКТИ'}</a></nav></div>`;
    const script = document.createElement('script'); script.src = english ? '../script.js?v=42' : '/script.js?v=42'; document.body.appendChild(script);
  }).catch(() => { root.innerHTML = `<section class="error-content"><h1>${english ? 'Something went wrong.' : 'Щось пішло не так.'}</h1></section>`; });
})();
