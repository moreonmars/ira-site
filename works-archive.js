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
  const customSelects = [];

  const addOptions = (select, values) => {
    if (!select) return;
    select.replaceChildren(new Option(english ? 'ALL' : 'УСІ', 'all'));
    values.forEach(value => select.append(new Option(value, slug(value))));
  };

  const setupCustomSelect = select => {
    if (!select || select.dataset.customReady) return;
    select.dataset.customReady = 'true';
    select.classList.add('archive-native-select');
    const wrapper = select.closest('.archive-select');
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'archive-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    const menu = document.createElement('div');
    menu.className = 'archive-select-menu';
    menu.setAttribute('role', 'listbox');
    menu.hidden = true;
    wrapper?.classList.add('has-custom-menu');
    select.after(trigger, menu);

    const sync = () => {
      const selected = select.options[select.selectedIndex];
      trigger.textContent = selected?.textContent || '';
      trigger.classList.toggle('is-active', select.value !== 'all' && select.value !== 'default');
      menu.querySelectorAll('[role="option"]').forEach(option => {
        option.classList.toggle('is-selected', option.dataset.value === select.value);
        option.setAttribute('aria-selected', option.dataset.value === select.value ? 'true' : 'false');
      });
    };
    select.addEventListener('change', sync);
    trigger.addEventListener('click', () => {
      const open = wrapper.classList.toggle('is-open');
      document.querySelectorAll('.archive-select.is-open').forEach(item => {
        if (item !== wrapper) { item.classList.remove('is-open'); item.querySelector('.archive-select-menu').hidden = true; item.querySelector('.archive-select-trigger').setAttribute('aria-expanded', 'false'); }
      });
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
    });
    select.addEventListener('change', () => { menu.hidden = true; wrapper.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); });
    [...select.options].forEach(option => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'archive-select-option';
      item.dataset.value = option.value;
      item.textContent = option.textContent;
      item.setAttribute('role', 'option');
      item.addEventListener('click', () => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      menu.append(item);
    });
    customSelects.push(sync);
    sync();
  };

  const render = () => {
    const selectedYear = yearSelect?.value || 'all';
    const selectedLocation = locationSelect?.value || 'all';
    const sort = sortSelect?.value || 'default';
    [yearSelect, locationSelect, sortSelect].forEach(select => select?.classList.toggle('is-active', select.value !== 'all' && select.value !== 'default'));
    customSelects.forEach(sync => sync());
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
    [yearSelect, locationSelect, sortSelect].forEach(setupCustomSelect);
    render();
    [yearSelect, locationSelect, sortSelect].forEach(select => select?.addEventListener('change', render));
    document.querySelectorAll('.archive-view-button').forEach(button => button.addEventListener('click', () => {
      const isGrid = button.dataset.view === 'grid';
      archive?.classList.toggle('is-grid-view', isGrid);
      document.querySelectorAll('.archive-view-button').forEach(item => item.classList.toggle('is-active', item === button));
    }));
  }).catch(() => { grid.innerHTML = '<p class="archive-error">Не вдалося завантажити архів.</p>'; });
})();
