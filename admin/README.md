# Адмінка

Адмінка використовує серверну авторизацію через email і пароль.

У Vercel потрібно додати три Environment Variables для Production:

- `ADMIN_EMAIL` — `irene.kharlamova@gmail.com`
- `ADMIN_PASSWORD` — пароль Іри
- `ADMIN_SESSION_SECRET` — довгий випадковий секрет, мінімум 32 символи

Пароль і секрет не додаються в Git та не передаються через фронтенд. Без цих змінних `/api/admin/login` навмисно повертає помилку конфігурації.
