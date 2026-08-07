# Адмінка

Адмінка використовує серверну авторизацію через email і пароль.

У Vercel потрібно додати три Environment Variables для Production:

- `ADMIN_EMAIL` — `irene.kharlamova@gmail.com`
- `ADMIN_PASSWORD` — пароль Іри
- `ADMIN_SESSION_SECRET` — довгий випадковий секрет, мінімум 32 символи
- `GITHUB_TOKEN` — GitHub fine-grained token з доступом Contents: Read and write до `moreonmars/ira-site`
- `BLOB_READ_WRITE_TOKEN` — токен Vercel Blob Store для завантаження зображень

Пароль і секрет не додаються в Git та не передаються через фронтенд. Без цих змінних `/api/admin/login` навмисно повертає помилку конфігурації.

`GITHUB_TOKEN` потрібен тільки для кнопки «Опублікувати»: API оновлює `content.json`, після чого Vercel створює новий deployment через GitHub-інтеграцію.

`BLOB_READ_WRITE_TOKEN` потрібен для кнопок завантаження обкладинки та галереї. Максимальний розмір одного файла в поточній версії — 4 MB.
