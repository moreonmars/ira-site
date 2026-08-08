(() => {
  const grid = document.querySelector('#archive-grid');
  if (!grid) return;
  const english = document.documentElement.lang === 'en';
  const archive = document.querySelector('.archive-works');
  const yearSelect = document.querySelector('#archive-year');
  const locationSelect = document.querySelector('#archive-location');
  const sortSelect = document.querySelector('#archive-sort');
  const count = document.querySelector('#archive-count');
  const assetUrl = source => source?.startsWith('http') ? source : new URL(String(source || '').replace(/^(\.\.\/)+/, ''), window.location.origin + '/').href;
  const label = (work, key) => work[key]?.[english ? 'en' : 'uk'] || work[key]?.uk || '';
  const slug = value => String(value || '').trim().toLocaleLowerCase();
  let allWorks = [];

  const addOptions = (select, values) => {
    if (!select) return;
    select.replaceChildren(new Option(english ? 'ALL' : 'УСІ', 'all'));
    values.forEach(value => select.append(new Option(value, slug(value))));
  };

  const render = () => {
    const selectedYear = yearSelect?.value || 'all';
    const selectedLocation = locationSelect?.value || 'all';
    const sort = sortSelect?.value || 'default';
    [yearSelect, locationSelect, sortSelect].forEach(select => select?.classList.toggle('is-active', select.value !== 'all' && select.value !== 'default'));
    const filtered = allWorks.filter(work => {
      const location = label(work, 'location');
      return (selectedYear === 'all' || String(work.year || '') === selectedYear) &&
        (selectedLocation === 'all' || slug(location) === selectedLocation);
    });
    const indexed = filtered.map((work, index) => ({ work, index }));
    if (sort === 'newest') indexed.sort((a, b) => Number(b.work.year || 0) - Number(a.work.year || 0) || a.index - b.index);
    if (sort === 'oldest') indexed.sort((a, b) => Number(a.work.year || 0) - Number(b.work.year || 0) || a.index - b.index);
    if (sort === 'title') indexed.sort((a, b) => label(a.work, 'title').localeCompare(label(b.work, 'title'), english ? 'en' : 'uk'));
    grid.replaceChildren(...indexed.map(({ work }, index) => {
      const title = label(work, 'title') || (english ? 'Untitled work' : 'Робота без назви');
      const location = label(work, 'location');
      const card = document.createElement('a');
      card.className = `work-card work-card--${['wide', 'portrait', 'landscape'][index % 3]}`;
      card.href = english ? `../../en/work.html?id=${encodeURIComponent(work.id)}` : `../work.html?id=${encodeURIComponent(work.id)}`;
      card.innerHTML = `<div class="media-wrap"><img src="${assetUrl(work.cover)}" alt="${title}" loading="lazy" decoding="async"></div><div class="work-meta"><span class="mono">${String(work.year || '')} / ${location}</span><h2>${title}</h2></div>`;
      return card;
    }));
    if (count) count.textContent = english ? `${filtered.length} ${filtered.length === 1 ? 'WORK' : 'WORKS'}` : `${filtered.length} ${filtered.length === 1 ? 'РОБОТА' : 'РОБІТ'}`;
  };

  fetch('/content.json', { cache: 'no-store' }).then(response => response.json()).then(content => {
    allWorks = (content.works || []).filter(work => work.status !== 'draft');
    addOptions(yearSelect, [...new Set(allWorks.map(work => String(work.year || '')).filter(Boolean))].sort((a, b) => Number(b) - Number(a)));
    addOptions(locationSelect, [...new Set(allWorks.map(work => label(work, 'location')).filter(Boolean))].sort((a, b) => a.localeCompare(b, english ? 'en' : 'uk')));
    render();
    [yearSelect, locationSelect, sortSelect].forEach(select => select?.addEventListener('change', render));
    document.querySelectorAll('.archive-view-button').forEach(button => button.addEventListener('click', () => {
      const isGrid = button.dataset.view === 'grid';
      archive?.classList.toggle('is-grid-view', isGrid);
      document.querySelectorAll('.archive-view-button').forEach(item => item.classList.toggle('is-active', item === button));
    }));
  }).catch(() => { grid.innerHTML = '<p class="archive-error">Не вдалося завантажити архів.</p>'; });
})();
