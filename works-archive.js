(() => {
  const grid = document.querySelector('#archive-grid');
  if (!grid) return;
  const english = document.documentElement.lang === 'en';
  const assetUrl = source => source?.startsWith('http') ? source : new URL(String(source || '').replace(/^\.\.\//, ''), window.location.origin + (english ? '/en/works/' : '/works/')).href;
  fetch('/content.json', { cache: 'no-store' }).then(response => response.json()).then(content => {
    const works = (content.works || []).filter(work => work.status !== 'draft');
    grid.replaceChildren(...works.map((work, index) => {
      const title = work.title?.[english ? 'en' : 'uk'] || work.title?.uk || 'Untitled work';
      const location = work.location?.[english ? 'en' : 'uk'] || work.location?.uk || '';
      const card = document.createElement('a');
      card.className = `work-card work-card--${['wide', 'portrait', 'landscape'][index % 3]} reveal`;
      card.href = english ? `../../en/work.html?id=${encodeURIComponent(work.id)}` : `../work.html?id=${encodeURIComponent(work.id)}`;
      card.innerHTML = `<div class="media-wrap"><img src="${assetUrl(work.cover)}" alt="${title}" loading="lazy" decoding="async"></div><div class="work-meta"><span class="mono">${String(work.year || '')} / ${location}</span><h2>${title}</h2></div>`;
      return card;
    }));
  }).catch(() => { grid.innerHTML = '<p class="archive-error">Не вдалося завантажити архів.</p>'; });
})();
