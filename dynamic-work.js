(() => {
  const root = document.querySelector('#dynamic-work');
  if (!root) return;
  const english = document.documentElement.lang === 'en';
  const id = new URLSearchParams(window.location.search).get('id');
  const assetUrl = source => source?.startsWith('http') ? source : new URL(String(source || '').replace(/^(\.\.\/)+/, ''), window.location.origin + '/').href;
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  fetch('/content.json', { cache: 'no-store' }).then(response => response.json()).then(content => {
    const work = content.works?.find(item => item.id === id && item.status !== 'draft');
    if (!work) { root.innerHTML = `<section class="error-content"><p class="eyebrow mono">404</p><h1>${english ? 'Work not found.' : 'Роботу не знайдено.'}</h1><a class="text-link mono" href="${english ? '/en/works/' : '/works/'}">${english ? '← All works' : '← Всі роботи'}</a></section>`; return; }
    const language = english ? 'en' : 'uk';
    const title = work.title?.[language] || work.title?.uk || '';
    const location = work.location?.[language] || work.location?.uk || '';
    const description = work.description?.[language] || work.description?.uk || '';
    const photographer = work.photographer?.[language] || work.photographer?.uk || '';
    const gallery = String(work.gallery || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean);
    document.title = `${title} — Ira Kharlamova`;
    root.innerHTML = `<a class="back-link" href="${english ? '/en/works/' : '/works/'}">← ${english ? 'ALL WORKS' : 'ВСІ РОБОТИ'}</a><header class="site-header"><a class="wordmark" href="${english ? '/en/' : '/'}"><img class="wordmark-icon" src="/ira-logo.png" alt="" aria-hidden="true"><span class="wordmark-label">IRA<br>KHARLAMOVA</span></a><div class="header-meta"><span>${esc(work.year)}</span><span>${esc(location)}</span></div><div class="header-actions"><a class="language" href="${english ? `/work.html?id=${encodeURIComponent(work.id)}` : `/en/work.html?id=${encodeURIComponent(work.id)}`}">${english ? 'EN / UA' : 'UA / EN'}</a><button type="button" class="menu-button">MENU</button></div></header><main><section class="project-hero"><img class="project-hero-media" src="${assetUrl(work.cover)}" alt="${esc(title)}" fetchpriority="high"><div class="project-hero-shade"></div><div class="project-hero-content"><span class="project-kicker mono">${esc(work.year)} / ${esc(location)}</span><h1 class="project-title">${esc(title)}</h1></div></section><section class="project-details"><div class="project-info"><p>${esc(description)}</p><div class="project-meta mono"><span>IRA KHARLAMOVA</span>${photographer ? `<span>${english ? 'Photography' : 'Фотограф'}: ${esc(photographer)}</span>` : ''}</div></div></section><section class="gallery">${gallery.map(source => `<figure class="reveal"><img src="${assetUrl(source)}" alt="${esc(title)}" loading="lazy" decoding="async">${photographer ? `<figcaption>${english ? 'Photography' : 'Фотограф'}: ${esc(photographer)}</figcaption>` : ''}</figure>`).join('')}</section><section class="project-footer"><div class="mono">${english ? 'ALL WORKS' : 'ВСІ РОБОТИ'}</div><a href="${english ? '/en/works/' : '/works/'}">${english ? 'BACK TO ARCHIVE ↗' : 'ДО АРХІВУ ↗'}</a></section></main><div class="menu-overlay" aria-hidden="true"><div class="menu-top mono"><span>INDEX</span><button class="menu-close">${english ? 'CLOSE ×' : 'ЗАКРИТИ ×'}</button></div><nav class="overlay-nav"><a href="${english ? '/en/works/' : '/works/'}">${english ? 'WORKS' : 'РОБОТИ'}</a><a href="${english ? '/en/#about' : '/#about'}">${english ? 'ABOUT' : 'ПРО МЕНЕ'}</a><a href="${english ? '/en/#current' : '/#current'}">CV</a><a href="${english ? '/en/#contact' : '/#contact'}">${english ? 'CONTACT' : 'КОНТАКТИ'}</a></nav></div>`;
    const script = document.createElement('script'); script.src = english ? '../script.js?v=40' : '/script.js?v=40'; document.body.appendChild(script);
  }).catch(() => { root.innerHTML = `<section class="error-content"><h1>${english ? 'Something went wrong.' : 'Щось пішло не так.'}</h1></section>`; });
})();
