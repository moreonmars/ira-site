(() => {
  fetch('/api/admin/session').then(response => response.json()).then(session => { if (!session.authenticated) location.replace('/admin/login.html'); }).catch(() => location.replace('/admin/login.html'));
  const initialWorks = [
    { id: 'archive-expedition', status: 'published', year: '2021', location: { uk: 'Київ / Харків / Львів', en: 'Kyiv / Kharkiv / Lviv' }, title: { uk: 'ARCHIVE: EXPEDITION', en: 'ARCHIVE: EXPEDITION' }, description: { uk: 'Серія сольних, дуетних і групових перформансів, створених у межах мандрівного проєкту.', en: 'A series of solo, duo and group performances created within a travelling project.' }, photographer: { uk: 'Anton Karuyk, Dmytro Laryn, Rostyslav Kuzyk.', en: 'Anton Karuyk, Dmytro Laryn, Rostyslav Kuzyk.' }, cover: '../assets/archive-kyiv-01.webp', gallery: '../assets/archive-kyiv-01.webp\n../assets/archive-kyiv-02.webp\n../assets/archive-kyiv-03.webp' },
    { id: 'crossing-2', status: 'published', year: '2021', location: { uk: 'Міжнародний проєкт', en: 'International project' }, title: { uk: 'CROSSING 2.0', en: 'CROSSING 2.0' }, description: { uk: 'Колективний перформативний проєкт про перехід, дистанцію та взаємну присутність.', en: 'A collective performance project about transition, distance and mutual presence.' }, photographer: { uk: 'Oleg Samoylenko.', en: 'Oleg Samoylenko.' }, cover: '../assets/crossing-01.webp', gallery: '../assets/crossing-01.webp\n../assets/crossing-02.webp\n../assets/crossing-03.webp' },
    { id: 'exploring-don-quixote', status: 'published', year: '2019', location: { uk: 'Франкфурт-на-Майні', en: 'Frankfurt am Main' }, title: { uk: 'EXPLORING DON QUIXOTE', en: 'EXPLORING DON QUIXOTE' }, description: { uk: 'Тривалий груповий перформанс і лабораторія під керівництвом Юргена Фрітца.', en: 'A durational group performance and laboratory led by Jürgen Fritz.' }, photographer: { uk: 'Jürgen Fritz.', en: 'Jürgen Fritz.' }, cover: '../assets/don-quixote-01.webp', gallery: '../assets/don-quixote-01.webp\n../assets/don-quixote-02.webp\n../assets/don-quixote-03.webp' },
    { id: 'zabih', status: 'published', year: '2019', location: { uk: 'Львів', en: 'Lviv' }, title: { uk: 'JÜRGEN FRITZ WORKSHOP / ZABIH', en: 'JÜRGEN FRITZ WORKSHOP / ZABIH' }, description: { uk: 'Груповий перформанс, створений під час воркшопу Юргена Фрітца.', en: 'A group performance developed during Jürgen Fritz’s workshop.' }, photographer: { uk: 'Jürgen Fritz.', en: 'Jürgen Fritz.' }, cover: '../assets/zabih-01.webp', gallery: '../assets/zabih-01.webp\n../assets/zabih-02.webp\n../assets/zabih-03.webp' },
    { id: 'shards-of-normality', status: 'published', year: '2025', location: { uk: 'Кельн / Берлін', en: 'Cologne / Berlin' }, title: { uk: 'SHARDS OF NORMALITY', en: 'SHARDS OF NORMALITY' }, description: { uk: 'Міжнародний ансамблевий проєкт про фрагментарність повсякденності.', en: 'An international ensemble project about the fragmentary nature of everyday life.' }, photographer: { uk: '', en: '' }, cover: '../assets/shards-01.webp', gallery: '../assets/shards-01.webp\n../assets/shards-02.webp\n../assets/shards-03.webp' },
    { id: 'performance-platform-lublin', status: 'published', year: '2017', location: { uk: 'Люблін', en: 'Lublin' }, title: { uk: 'BORDER', en: 'BORDER' }, description: { uk: 'Сольна робота, показана на Performance Platform Lublin.', en: 'A solo work presented at Performance Platform Lublin.' }, photographer: { uk: '', en: '' }, cover: '../assets/border-01.webp', gallery: '../assets/border-01.webp\n../assets/border-02.webp\n../assets/border-03.webp' }
  ];
  const initialProfile = {
    heading: {
      uk: 'ІРА ХАРЛАМОВА — АРТИСТКА ПЕРФОРМАНСУ З УКРАЇНИ, ЯКА ПРАЦЮЄ НА ПЕРЕТИНІ ТІЛЕСНОЇ ПРАКТИКИ, ПАМ’ЯТІ ТА КОЛЕКТИВНОЇ ДІЇ.',
      en: 'IRA KHARLAMOVA IS A PERFORMANCE ARTIST FROM UKRAINE WORKING AT THE INTERSECTION OF EMBODIED PRACTICE, MEMORY AND COLLECTIVE ACTION.'
    },
    paragraphs: {
      uk: ['Її практика виростає з фізичного театру, live art і довготривалого дослідження тіла як носія досвіду. Іра — співзасновниця ГО «Мистецтво перформансу України» та засновниця проєкту «АРХІВ: мистецтво перформансу України».', 'Іра брала участь у міжнародних лабораторіях, фестивалях і проєктах в Україні, Німеччині та Польщі.'],
      en: ['Her practice grows from physical theatre, live art and a long-term investigation of the body as a carrier of experience. Ira is co-founder of the NGO “Performance art of Ukraine” and founder of “ARCHIVE: performance art of Ukraine”.', 'Ira has participated in international laboratories, festivals and projects in Ukraine, Germany and Poland.']
    },
    cv: 'assets/ira-kharlamova-cv.pdf',
    email: 'irene.kharlamova@gmail.com',
    instagram: 'https://www.instagram.com/_ira.kharlamova_/'
  };
  const storageKey = 'ira-admin-drafts-v1';
  const profileStorageKey = 'ira-admin-profile-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  let works = JSON.parse(localStorage.getItem(storageKey) || 'null') || clone(initialWorks);
  let profile = JSON.parse(localStorage.getItem(profileStorageKey) || 'null') || clone(initialProfile);
  let selectedId = works[0]?.id;
  let locale = 'uk';
  const list = document.querySelector('#work-list');
  const editor = document.querySelector('#editor-panel');
  const toast = message => { document.querySelector('#toast').textContent = message; window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => { document.querySelector('#toast').textContent = ''; }, 2600); };
  const save = () => { localStorage.setItem(storageKey, JSON.stringify(works)); localStorage.setItem(profileStorageKey, JSON.stringify(profile)); toast('Збережено локально'); renderList(); };
  const selected = () => works.find(work => work.id === selectedId) || works[0];
  const renderList = () => {
    document.querySelector('#work-count').textContent = works.length;
    list.replaceChildren(...works.map(work => {
      const row = document.createElement('article'); row.className = `work-row${work.id === selectedId ? ' is-selected' : ''}`; row.draggable = true; row.dataset.id = work.id;
      row.innerHTML = `<div class="work-thumb"><img src="${work.cover}" alt=""></div><div><h3>${work.title[locale] || work.title.uk}</h3><p>${work.year} / ${work.location[locale] || work.location.uk}</p></div><span class="work-status${work.status === 'draft' ? ' is-draft' : ''}" title="${work.status}"></span>`;
      row.addEventListener('click', () => { selectedId = work.id; renderList(); renderEditor(); });
      row.addEventListener('dragstart', () => { row.classList.add('is-dragging'); });
      row.addEventListener('dragend', () => { row.classList.remove('is-dragging'); });
      row.addEventListener('dragover', event => event.preventDefault());
      row.addEventListener('drop', event => { event.preventDefault(); const from = works.findIndex(item => item.id === selectedId); const to = works.findIndex(item => item.id === row.dataset.id); if (from < 0 || to < 0 || from === to) return; const [moved] = works.splice(from, 1); works.splice(to, 0, moved); save(); });
      return row;
    }));
  };
  const renderProfile = () => {
    const panel = document.querySelector('#profile-editor');
    if (!panel) return;
    panel.innerHTML = `<div class="locale-tabs"><button type="button" class="locale-tab${locale === 'uk' ? ' is-active' : ''}" data-profile-locale="uk">UA</button><button type="button" class="locale-tab${locale === 'en' ? ' is-active' : ''}" data-profile-locale="en">EN</button></div><div class="form-grid"><div class="field full"><label>Заголовок</label><textarea data-profile-field="heading">${profile.heading[locale] || ''}</textarea></div><div class="field full"><label>Опис — абзац 1</label><textarea data-profile-paragraph="0">${profile.paragraphs[locale]?.[0] || ''}</textarea></div><div class="field full"><label>Опис — абзац 2</label><textarea data-profile-paragraph="1">${profile.paragraphs[locale]?.[1] || ''}</textarea></div><div class="field full"><label>Посилання на CV</label><input data-profile-field="cv" value="${profile.cv || ''}"></div><div class="field"><label>Email</label><input data-profile-field="email" type="email" value="${profile.email || ''}"></div><div class="field"><label>Instagram</label><input data-profile-field="instagram" value="${profile.instagram || ''}"></div></div>`;
    panel.querySelectorAll('[data-profile-locale]').forEach(button => button.addEventListener('click', () => { locale = button.dataset.profileLocale; renderProfile(); }));
    panel.querySelectorAll('[data-profile-field]').forEach(field => field.addEventListener('input', event => { profile[event.target.dataset.profileField] = event.target.value; }));
    panel.querySelectorAll('[data-profile-paragraph]').forEach(field => field.addEventListener('input', event => { profile.paragraphs[locale][Number(event.target.dataset.profileParagraph)] = event.target.value; }));
  };
  const renderEditor = () => {
    const work = selected(); if (!work) { editor.innerHTML = '<p>Додайте першу роботу.</p>'; return; }
    work.photographer ||= { uk: '', en: '' };
    editor.innerHTML = `<div class="editor-head"><div><p class="eyebrow">EDIT WORK</p><h2>${work.title[locale] || 'Нова робота'}</h2></div><select class="status-select" id="status-field"><option value="published" ${work.status === 'published' ? 'selected' : ''}>Опубліковано</option><option value="draft" ${work.status === 'draft' ? 'selected' : ''}>Чернетка</option></select></div><div class="locale-tabs"><button type="button" class="locale-tab${locale === 'uk' ? ' is-active' : ''}" data-locale="uk">UA</button><button type="button" class="locale-tab${locale === 'en' ? ' is-active' : ''}" data-locale="en">EN</button></div><div class="form-grid"><div class="field"><label for="title-field">Назва</label><input id="title-field" data-field="title" value="${work.title[locale] || ''}"></div><div class="field"><label for="year-field">Рік</label><input id="year-field" data-field="year" value="${work.year}"></div><div class="field full"><label for="location-field">Місце / формат</label><input id="location-field" data-field="location" value="${work.location[locale] || ''}"></div><div class="field full"><label for="description-field">Опис</label><textarea id="description-field" data-field="description">${work.description[locale] || ''}</textarea></div><div class="field full"><label for="photographer-field">Фотограф</label><input id="photographer-field" data-field="photographer" value="${work.photographer[locale] || ''}" placeholder="Ім’я фотографа"></div><div class="field full"><label for="cover-field">Головне фото</label><input id="cover-field" data-field="cover" value="${work.cover}"><input id="cover-upload" type="file" accept="image/*"><div class="cover-preview"${work.cover ? '' : ' hidden'}><img src="${work.cover}" alt="Попередній перегляд"></div></div><div class="field full"><label for="gallery-field">Фотографії роботи</label><textarea id="gallery-field" data-field="gallery" spellcheck="false">${work.gallery}</textarea><input id="gallery-upload" type="file" accept="image/*" multiple></div></div><div class="editor-foot"><span class="mono">ID: ${work.id}</span><button type="button" class="text-button danger-button" id="delete-work">Видалити чернетку</button></div>`;
    const galleryUpload = editor.querySelector('#gallery-upload');
    const renderGalleryPreview = () => {
      const urls = (work.gallery || '').split(/\r?\n/).map(url => url.trim()).filter(Boolean);
      let preview = editor.querySelector('#gallery-preview');
      if (!preview) { preview = document.createElement('div'); preview.id = 'gallery-preview'; preview.className = 'gallery-preview'; galleryUpload.before(preview); }
      preview.replaceChildren(...urls.map((url, index) => {
        const item = document.createElement('div'); item.className = 'gallery-item';
        const image = document.createElement('img'); image.src = url; image.alt = `${work.title[locale] || 'Робота'} — фото ${index + 1}`;
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'gallery-remove'; remove.setAttribute('aria-label', 'Видалити фото'); remove.textContent = '×';
        remove.addEventListener('click', async () => {
          work.gallery = urls.filter((_, itemIndex) => itemIndex !== index).join('\n');
          renderGalleryPreview();
          try {
            const response = await fetch('/api/admin/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
            if (!response.ok) throw new Error();
            toast('Фото видалено');
          } catch { toast('Фото прибрано з роботи'); }
        });
        item.append(image, remove); return item;
      }));
    };
    renderGalleryPreview();
    editor.querySelectorAll('[data-locale]').forEach(button => button.addEventListener('click', () => { locale = button.dataset.locale; renderList(); renderEditor(); }));
    editor.querySelectorAll('[data-field]').forEach(field => field.addEventListener('input', event => { const key = event.target.dataset.field; work[key] = ['title', 'location', 'description'].includes(key) ? { ...work[key], [locale]: event.target.value } : event.target.value; if (key === 'cover') editor.querySelector('.cover-preview img').src = event.target.value; }));
    const upload = async (file, multiple = false) => {
      const formData = new FormData(); formData.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не вдалося завантажити файл.');
      if (multiple) { work.gallery = `${work.gallery ? `${work.gallery}\n` : ''}${result.url}`; }
      else { work.cover = result.url; }
      return result.url;
    };
    editor.querySelector('#cover-upload').addEventListener('change', async event => { const [file] = event.target.files; if (!file) return; try { const url = await upload(file); editor.querySelector('#cover-field').value = url; editor.querySelector('.cover-preview').hidden = false; editor.querySelector('.cover-preview img').src = url; toast('Обкладинку завантажено'); } catch (error) { toast(error.message); } });
    galleryUpload.addEventListener('change', async event => { try { for (const file of event.target.files) await upload(file, true); editor.querySelector('#gallery-field').value = work.gallery; renderGalleryPreview(); toast('Галерею завантажено'); } catch (error) { toast(error.message); } });
    editor.querySelector('#status-field').addEventListener('change', event => { work.status = event.target.value; renderList(); });
    editor.querySelector('#delete-work').addEventListener('click', () => { if (works.length === 1) return; works = works.filter(item => item.id !== work.id); selectedId = works[0].id; save(); renderEditor(); });
  };
  document.querySelector('#save-button').addEventListener('click', save);
  document.querySelector('#publish-button').addEventListener('click', async () => { save(); const button = document.querySelector('#publish-button'); button.disabled = true; try { const response = await fetch('/api/admin/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ works, profile }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Публікація не вдалася.'); toast('Опубліковано · деплой запущено'); } catch (error) { toast(error.message); } finally { button.disabled = false; } });
  document.querySelector('#logout-button').addEventListener('click', async () => { await fetch('/api/admin/logout', { method: 'POST' }); location.replace('/admin/login.html'); });
  document.querySelector('#new-work').addEventListener('click', () => { const id = `new-work-${Date.now()}`; works.unshift({ id, status: 'draft', year: new Date().getFullYear().toString(), location: { uk: '', en: '' }, title: { uk: 'НОВА РОБОТА', en: 'NEW WORK' }, description: { uk: '', en: '' }, photographer: { uk: '', en: '' }, cover: '', gallery: '' }); selectedId = id; renderList(); renderEditor(); });
  document.querySelector('#export-button').addEventListener('click', () => { const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), works }, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'ira-portfolio-draft.json'; link.click(); URL.revokeObjectURL(link.href); toast('JSON експортовано'); });
  document.querySelector('#import-input').addEventListener('change', event => { const [file] = event.target.files; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const imported = JSON.parse(reader.result); if (!Array.isArray(imported.works)) throw new Error('Invalid'); works = imported.works; selectedId = works[0]?.id; save(); renderEditor(); toast('JSON імпортовано'); } catch { toast('Не вдалося імпортувати'); } }; reader.readAsText(file); });
  document.querySelector('#reset-button').addEventListener('click', () => { works = clone(initialWorks); selectedId = works[0].id; save(); renderEditor(); });
  document.querySelector('#notice-close').addEventListener('click', event => event.currentTarget.closest('.notice').remove());
  document.querySelectorAll('.side-link').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.side-link').forEach(item => item.classList.toggle('is-active', item === button)); document.querySelectorAll('[data-view-panel]').forEach(panel => { panel.hidden = panel.dataset.viewPanel !== button.dataset.view; }); const title = document.querySelector('.topbar h1'); if (title) title.textContent = { works: 'Роботи', profile: 'Про мене', settings: 'Налаштування' }[button.dataset.view] || 'Роботи'; window.scrollTo({ top: 0, behavior: 'smooth' }); if (button.dataset.view === 'profile') renderProfile(); }));
  renderList(); renderEditor(); renderProfile();
})();
