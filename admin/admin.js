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
    portrait: 'assets/portrait.webp',
    email: 'irene.kharlamova@gmail.com',
    instagram: 'https://www.instagram.com/_ira.kharlamova_/'
  };
  const storageKey = 'ira-admin-drafts-v1';
  const profileStorageKey = 'ira-admin-profile-v1';
  const backupKey = 'ira-admin-backup-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  const normalizeProfile = value => {
    const input = value && typeof value === 'object' ? value : {};
    const heading = typeof input.heading === 'string'
      ? { uk: input.heading, en: input.heading }
      : { ...clone(initialProfile.heading), ...(input.heading || {}) };
    const paragraphs = { ...clone(initialProfile.paragraphs), ...(input.paragraphs || {}) };
    paragraphs.uk = Array.isArray(paragraphs.uk) ? paragraphs.uk : clone(initialProfile.paragraphs.uk);
    paragraphs.en = Array.isArray(paragraphs.en) ? paragraphs.en : clone(initialProfile.paragraphs.en);
    return { ...clone(initialProfile), ...input, heading, paragraphs, portrait: input.portrait || initialProfile.portrait };
  };
  let works = JSON.parse(localStorage.getItem(storageKey) || 'null') || clone(initialWorks);
  let profile = normalizeProfile(JSON.parse(localStorage.getItem(profileStorageKey) || 'null'));
  let savedSnapshot = { works: clone(works), profile: clone(profile) };
  let selectedId = works[0]?.id;
  let locale = 'uk';
  const list = document.querySelector('#work-list');
  const editor = document.querySelector('#editor-panel');
  const toast = message => { document.querySelector('#toast').textContent = message; window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => { document.querySelector('#toast').textContent = ''; }, 2600); };
  const compressImage = file => new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/') || file.size <= 2 * 1024 * 1024) return resolve(file);
    const source = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(source);
      const canvas = document.createElement('canvas');
      const maxSide = 2600;
      let scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const encode = () => {
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error('Не вдалося стиснути фото.'));
          if (blob.size <= 2 * 1024 * 1024 || scale < 0.45) return resolve(new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' }));
          scale *= 0.84;
          encode();
        }, 'image/webp', 0.92);
      };
      encode();
    };
    image.onerror = () => { URL.revokeObjectURL(source); reject(new Error('Не вдалося прочитати фото.')); };
    image.src = source;
  });
  const syncDraft = async () => { try { await fetch('/api/admin/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ works, profile }) }); } catch { /* local backup remains available when cloud sync is unavailable */ } };
  const save = () => { profile = normalizeProfile(profile); const snapshot = { works: clone(works), profile: clone(profile), savedAt: new Date().toISOString() }; localStorage.setItem(storageKey, JSON.stringify(works)); localStorage.setItem(profileStorageKey, JSON.stringify(profile)); localStorage.setItem(backupKey, JSON.stringify(snapshot)); savedSnapshot = { works: clone(works), profile: clone(profile) }; syncDraft(); toast('Збережено'); renderList(); };
  const publishWorks = async () => { const response = await fetch('/api/admin/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ works, profile }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Публікація не вдалася.'); return result; };
  const restoreSaved = () => { works = clone(savedSnapshot.works); profile = clone(savedSnapshot.profile); localStorage.setItem(storageKey, JSON.stringify(works)); localStorage.setItem(profileStorageKey, JSON.stringify(profile)); selectedId = works[0]?.id; renderList(); renderEditor(); renderProfile(); renderSettings(); syncDraft(); toast('Зміни скасовано'); };
  const loadCloudDraft = async () => { try { const response = await fetch('/api/admin/draft'); if (!response.ok) return; const result = await response.json(); if (!result.draft?.works) return; const localBackup = JSON.parse(localStorage.getItem(backupKey) || 'null'); if (localBackup?.savedAt && result.draft.updatedAt && localBackup.savedAt >= result.draft.updatedAt) return; works = mergeFullGalleries(result.draft.works); profile = normalizeProfile(result.draft.profile); savedSnapshot = { works: clone(works), profile: clone(profile) }; localStorage.setItem(storageKey, JSON.stringify(works)); localStorage.setItem(profileStorageKey, JSON.stringify(profile)); localStorage.setItem(backupKey, JSON.stringify({ works: clone(works), profile: clone(profile), savedAt: result.draft.updatedAt || new Date().toISOString() })); selectedId = works[0]?.id; renderList(); renderEditor(); renderProfile(); renderSettings(); toast('Синхронізовано'); } catch { /* local data remains the fallback */ } };
  const syncPublishedContent = async () => {
    try {
      const response = await fetch('/content.json', { cache: 'no-store' });
      if (!response.ok) return;
      const published = await response.json();
      const localBackup = JSON.parse(localStorage.getItem(backupKey) || 'null');
      const publishedAt = Date.parse(published.updatedAt || '');
      const localAt = Date.parse(localBackup?.savedAt || '');
      if (!publishedAt || (localAt && publishedAt <= localAt)) return;

      const publishedWorks = Array.isArray(published.works) ? published.works : [];
      const publishedIds = new Set(publishedWorks.map(work => work.id));
      const localDrafts = works.filter(work => work.status === 'draft' && !publishedIds.has(work.id));
      works = [...localDrafts, ...mergeFullGalleries(publishedWorks)];
      profile = normalizeProfile(published.profile);
      savedSnapshot = { works: clone(works), profile: clone(profile) };
      localStorage.setItem(storageKey, JSON.stringify(works));
      localStorage.setItem(profileStorageKey, JSON.stringify(profile));
      localStorage.setItem(backupKey, JSON.stringify({ works: clone(works), profile: clone(profile), savedAt: published.updatedAt }));
      selectedId = works[0]?.id;
      renderList(); renderEditor(); renderProfile(); renderSettings();
      toast('Синхронізовано з сайтом');
    } catch { /* local data remains the fallback */ }
  };
  const fullGalleryById = {
    'archive-expedition': ['../assets/archive-kyiv-01.webp', '../assets/archive-kyiv-02.webp', '../assets/archive-kyiv-03.webp', '../assets/archive-kyiv-04.webp', '../assets/archive-kyiv-05.webp', '../assets/archive-kyiv-06.webp', '../assets/archive-kharkiv-01.webp', '../assets/archive-kharkiv-02.webp', '../assets/archive-kharkiv-03.webp', '../assets/archive-kharkiv-04.webp', '../assets/archive-lviv-01.webp', '../assets/archive-lviv-02.webp', '../assets/archive-lviv-03.webp', '../assets/archive-lviv-04.webp', '../assets/archive-lviv-05.webp'],
    'crossing-2': ['../assets/crossing-01.webp', '../assets/crossing-02.webp', '../assets/crossing-03.webp', '../assets/crossing-04.webp'],
    'exploring-don-quixote': ['../assets/don-quixote-01.webp', '../assets/don-quixote-02.webp', '../assets/don-quixote-03.webp', '../assets/don-quixote-04.webp', '../assets/don-quixote-05.webp'],
    zabih: ['../assets/zabih-01.webp', '../assets/zabih-02.webp', '../assets/zabih-03.webp', '../assets/zabih-04.webp', '../assets/zabih-05.webp'],
    'shards-of-normality': ['../assets/shards-01.webp', '../assets/shards-02.webp', '../assets/shards-03.webp'],
    'performance-platform-lublin': ['../assets/border-01.webp', '../assets/border-02.webp', '../assets/border-03.webp', '../assets/border-04.webp', '../assets/border-05.webp', '../assets/border-06.webp']
  };
  const mergeFullGalleries = items => items.map(work => { const complete = fullGalleryById[work.id]; const current = String(work.gallery || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean); if (complete?.length > current.length && current.every(item => complete.includes(item))) return { ...work, gallery: complete.join('\n') }; return work; });
  works = mergeFullGalleries(works);
  savedSnapshot = { works: clone(works), profile: clone(profile) };
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
    const portraitPreview = profile.portrait?.startsWith('http') ? profile.portrait : `../${String(profile.portrait || '').replace(/^\.\//, '')}`;
    panel.innerHTML = `<div class="locale-tabs"><button type="button" class="locale-tab${locale === 'uk' ? ' is-active' : ''}" data-profile-locale="uk">UA</button><button type="button" class="locale-tab${locale === 'en' ? ' is-active' : ''}" data-profile-locale="en">EN</button></div><div class="form-grid"><div class="field full"><label>Заголовок</label><textarea data-profile-field="heading">${profile.heading[locale] || ''}</textarea></div><div class="field full"><label>Опис — абзац 1</label><textarea data-profile-paragraph="0">${profile.paragraphs[locale]?.[0] || ''}</textarea></div><div class="field full"><label>Опис — абзац 2</label><textarea data-profile-paragraph="1">${profile.paragraphs[locale]?.[1] || ''}</textarea></div><div class="field full profile-media-field"><label>Портретне фото</label><input id="profile-portrait-upload" type="file" accept="image/*"><div class="profile-portrait-preview"><img src="${portraitPreview}" alt="Портрет"></div></div><div class="field full profile-media-field"><label>CV-файл</label><input id="profile-cv-upload" type="file" accept="application/pdf"><span class="profile-file-status">${profile.cv ? 'CV-файл завантажено' : 'CV-файл ще не додано'}</span></div><div class="field"><label>Email</label><input data-profile-field="email" type="email" value="${profile.email || ''}"></div><div class="field"><label>Instagram</label><input data-profile-field="instagram" value="${profile.instagram || ''}"></div></div>`;
    panel.querySelectorAll('[data-profile-locale]').forEach(button => button.addEventListener('click', () => { locale = button.dataset.profileLocale; renderProfile(); }));
    panel.querySelectorAll('[data-profile-field]').forEach(field => field.addEventListener('input', event => { const key = event.target.dataset.profileField; if (key === 'heading') { profile.heading ||= {}; profile.heading[locale] = event.target.value; } else { profile[key] = event.target.value; } }));
    panel.querySelectorAll('[data-profile-paragraph]').forEach(field => field.addEventListener('input', event => { profile.paragraphs[locale][Number(event.target.dataset.profileParagraph)] = event.target.value; }));
    const uploadProfileFile = async file => { const prepared = await compressImage(file); const formData = new FormData(); formData.append('file', prepared, prepared.name); const response = await fetch('/api/admin/upload', { method: 'POST', body: formData }); const text = await response.text(); let result; try { result = JSON.parse(text); } catch { throw new Error('Сервер не прийняв файл. Спробуйте ще раз.'); } if (!response.ok) throw new Error(result.error || 'Не вдалося завантажити файл.'); return result.url; };
    panel.querySelector('#profile-portrait-upload').addEventListener('change', async event => { const [file] = event.target.files; if (!file) return; try { profile.portrait = await uploadProfileFile(file); renderProfile(); toast('Портрет завантажено'); } catch (error) { toast(error.message); } });
    panel.querySelector('#profile-cv-upload').addEventListener('change', async event => { const [file] = event.target.files; if (!file) return; try { profile.cv = await uploadProfileFile(file); renderProfile(); toast('CV завантажено'); } catch (error) { toast(error.message); } });
  };
  const renderSettings = () => {
    const panel = document.querySelector('#settings-editor');
    if (!panel) return;
    panel.innerHTML = '<form class="settings-form" id="password-form"><div class="field"><label for="current-password">Поточний пароль</label><input id="current-password" name="currentPassword" type="password" autocomplete="current-password" required></div><div class="field"><label for="new-password">Новий пароль</label><input id="new-password" name="newPassword" type="password" minlength="8" autocomplete="new-password" required><small>Щонайменше 8 символів.</small></div><div class="field"><label for="confirm-password">Повторіть новий пароль</label><input id="confirm-password" name="confirmPassword" type="password" minlength="8" autocomplete="new-password" required></div><button class="primary-button" type="submit">Змінити пароль</button><p class="settings-feedback" id="settings-feedback" role="status" aria-live="polite"></p></form>';
    const form = panel.querySelector('#password-form');
    const feedback = panel.querySelector('#settings-feedback');
    form.addEventListener('submit', async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(form)); feedback.textContent = ''; if (data.newPassword !== data.confirmPassword) { feedback.textContent = 'Паролі не збігаються.'; feedback.dataset.state = 'error'; return; } const button = form.querySelector('button'); button.disabled = true; try { const response = await fetch('/api/admin/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Не вдалося змінити пароль.'); form.reset(); feedback.textContent = 'Пароль змінено.'; feedback.dataset.state = 'success'; } catch (error) { feedback.textContent = error.message; feedback.dataset.state = 'error'; } finally { button.disabled = false; } });
  };
  const renderEditor = () => {
    const work = selected(); if (!work) { editor.innerHTML = '<p>Додайте першу роботу.</p>'; return; }
    if (typeof work.photographer === 'string') work.photographer = { uk: work.photographer, en: work.photographer };
    work.photographer ||= { uk: '', en: '' };
    work.galleryCredits ||= '';
    editor.innerHTML = `<div class="editor-head"><div><p class="eyebrow">EDIT WORK</p><h2>${work.title[locale] || 'Нова робота'}</h2></div><div class="editor-head-actions">${work.status === 'published' ? '<button type="button" class="ghost-button unpublish-button" id="unpublish-work">Зняти з публікації</button>' : ''}<select class="status-select" id="status-field"><option value="published" ${work.status === 'published' ? 'selected' : ''}>Опубліковано</option><option value="draft" ${work.status === 'draft' ? 'selected' : ''}>Чернетка</option></select></div></div><div class="locale-tabs"><button type="button" class="locale-tab${locale === 'uk' ? ' is-active' : ''}" data-locale="uk">UA</button><button type="button" class="locale-tab${locale === 'en' ? ' is-active' : ''}" data-locale="en">EN</button></div><div class="form-grid"><div class="field"><label for="title-field">Назва</label><input id="title-field" data-field="title" value="${work.title[locale] || ''}"></div><div class="field"><label for="year-field">Рік</label><input id="year-field" data-field="year" value="${work.year}"></div><div class="field full"><label for="location-field">Місце / формат</label><input id="location-field" data-field="location" value="${work.location[locale] || ''}"></div><div class="field full"><label for="description-field">Опис</label><textarea id="description-field" data-field="description">${work.description[locale] || ''}</textarea></div><div class="field full"><label for="photographer-field">Фотограф / фотографи</label><input id="photographer-field" data-field="photographer" value="${work.photographer[locale] || ''}" placeholder="Загальний кредит роботи"></div><div class="field full"><label for="cover-field">Головне фото</label><input id="cover-field" data-field="cover" value="${work.cover}"><input id="cover-upload" type="file" accept="image/*"><div class="cover-preview"${work.cover ? '' : ' hidden'}><img src="${work.cover}" alt="Попередній перегляд"></div></div><div class="field full"><label for="gallery-field">Фотографії роботи</label><textarea id="gallery-field" data-field="gallery" spellcheck="false">${work.gallery}</textarea><input id="gallery-upload" type="file" accept="image/*" multiple><small class="field-help">Для кожного фото можна вказати окремого фотографа нижче. Якщо поле порожнє, використовується загальний кредит.</small></div></div><div class="editor-foot"><span class="mono">ID: ${work.id}</span><button type="button" class="text-button danger-button" id="delete-work">Видалити чернетку</button></div>`;
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
          const credits = String(work.galleryCredits || '').split(/\r?\n/);
          work.galleryCredits = credits.filter((_, itemIndex) => itemIndex !== index).join('\n');
          renderGalleryPreview();
          try {
            const response = await fetch('/api/admin/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
            if (!response.ok) throw new Error();
            toast('Фото видалено');
          } catch { toast('Фото прибрано з роботи'); }
        });
        const credit = document.createElement('input'); credit.type = 'text'; credit.className = 'gallery-credit'; credit.placeholder = 'Фотограф цього фото'; credit.value = String(work.galleryCredits || '').split(/\r?\n/)[index] || '';
        credit.addEventListener('input', event => {
          const credits = String(work.galleryCredits || '').split(/\r?\n/);
          while (credits.length < urls.length) credits.push('');
          credits[index] = event.target.value;
          work.galleryCredits = credits.join('\n');
        });
        item.append(image, remove, credit); return item;
      }));
    };
    renderGalleryPreview();
    editor.querySelectorAll('[data-locale]').forEach(button => button.addEventListener('click', () => { locale = button.dataset.locale; renderList(); renderEditor(); }));
    editor.querySelectorAll('[data-field]').forEach(field => field.addEventListener('input', event => { const key = event.target.dataset.field; work[key] = ['title', 'location', 'description', 'photographer'].includes(key) ? { ...work[key], [locale]: event.target.value } : event.target.value; if (key === 'cover') editor.querySelector('.cover-preview img').src = event.target.value; }));
    const upload = async (file, multiple = false) => {
      const prepared = await compressImage(file);
      const formData = new FormData(); formData.append('file', prepared, prepared.name);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const text = await response.text(); let result;
      try { result = JSON.parse(text); } catch { throw new Error('Сервер не прийняв файл. Спробуйте ще раз.'); }
      if (!response.ok) throw new Error(result.error || 'Не вдалося завантажити файл.');
      if (multiple) { work.gallery = `${work.gallery ? `${work.gallery}\n` : ''}${result.url}`; work.galleryCredits = `${work.galleryCredits ? `${work.galleryCredits}\n` : ''}`; }
      else { work.cover = result.url; }
      return result.url;
    };
    editor.querySelector('#cover-upload').addEventListener('change', async event => { const [file] = event.target.files; if (!file) return; try { const url = await upload(file); editor.querySelector('#cover-field').value = url; editor.querySelector('.cover-preview').hidden = false; editor.querySelector('.cover-preview img').src = url; toast('Обкладинку завантажено'); } catch (error) { toast(error.message); } });
    galleryUpload.addEventListener('change', async event => { try { for (const file of event.target.files) await upload(file, true); editor.querySelector('#gallery-field').value = work.gallery; renderGalleryPreview(); toast('Галерею завантажено'); } catch (error) { toast(error.message); } });
    editor.querySelector('#status-field').addEventListener('change', event => { work.status = event.target.value; renderList(); });
    editor.querySelector('#unpublish-work')?.addEventListener('click', async event => { if (!window.confirm('Зняти цю роботу з публікації? Вона зникне з сайту.')) return; const button = event.currentTarget; button.disabled = true; button.textContent = 'Знімаю…'; work.status = 'draft'; save(); try { await publishWorks(); toast('Роботу знято з публікації'); renderEditor(); } catch (error) { work.status = 'published'; save(); renderEditor(); toast(error.message); } });
    editor.querySelector('#delete-work').addEventListener('click', () => { if (works.length === 1) return; works = works.filter(item => item.id !== work.id); selectedId = works[0].id; save(); renderEditor(); });
  };
  document.querySelector('#save-button').addEventListener('click', save);
  document.querySelector('#discard-button').addEventListener('click', restoreSaved);
  document.querySelector('#publish-button').addEventListener('click', async () => { save(); const button = document.querySelector('#publish-button'); const status = document.querySelector('#publish-status'); button.disabled = true; status.textContent = 'Публікую…'; status.dataset.state = 'loading'; try { await publishWorks(); status.textContent = 'Опубліковано'; status.dataset.state = 'success'; toast('Зміни опубліковано'); } catch (error) { status.textContent = 'Не опубліковано'; status.dataset.state = 'error'; toast(error.message); } finally { button.disabled = false; } });
  document.querySelector('#logout-button').addEventListener('click', async () => { await fetch('/api/admin/logout', { method: 'POST' }); location.replace('/admin/login.html'); });
  document.querySelector('#new-work').addEventListener('click', () => { const id = `new-work-${Date.now()}`; works.unshift({ id, status: 'draft', year: new Date().getFullYear().toString(), location: { uk: '', en: '' }, title: { uk: 'НОВА РОБОТА', en: 'NEW WORK' }, description: { uk: '', en: '' }, photographer: { uk: '', en: '' }, cover: '', gallery: '', galleryCredits: '' }); selectedId = id; renderList(); renderEditor(); });
  document.querySelector('#export-button').addEventListener('click', () => { const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), works }, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'ira-portfolio-draft.json'; link.click(); URL.revokeObjectURL(link.href); toast('JSON експортовано'); });
  document.querySelector('#import-input').addEventListener('change', event => { const [file] = event.target.files; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const imported = JSON.parse(reader.result); if (!Array.isArray(imported.works)) throw new Error('Invalid'); works = imported.works; selectedId = works[0]?.id; save(); renderEditor(); toast('JSON імпортовано'); } catch { toast('Не вдалося імпортувати'); } }; reader.readAsText(file); });
  document.querySelector('#reset-button').addEventListener('click', () => { works = clone(initialWorks); selectedId = works[0].id; save(); renderEditor(); });
  document.querySelector('#notice-close').addEventListener('click', event => event.currentTarget.closest('.notice').remove());
  document.querySelectorAll('.side-link').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.side-link').forEach(item => item.classList.toggle('is-active', item === button)); document.querySelectorAll('[data-view-panel]').forEach(panel => { panel.hidden = panel.dataset.viewPanel !== button.dataset.view; }); const title = document.querySelector('.topbar h1'); if (title) title.textContent = { works: 'Роботи', profile: 'Про мене', settings: 'Налаштування' }[button.dataset.view] || 'Роботи'; window.scrollTo({ top: 0, behavior: 'smooth' }); if (button.dataset.view === 'profile') renderProfile(); if (button.dataset.view === 'settings') renderSettings(); }));
  renderList(); renderEditor(); renderProfile(); renderSettings(); loadCloudDraft().finally(syncPublishedContent);
})();
