import { readPasswordOverride, passwordMatches, safeEqual, sessionCookieHeader, checkLoginLockout, recordLoginFailure, clearLoginAttempts } from './_auth.js';

const expectedEmail = () => (process.env.ADMIN_EMAIL || 'irene.kharlamova@gmail.com').trim().toLowerCase();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) return res.status(503).json({ error: 'Admin auth is not configured yet.' });
  const lockout = await checkLoginLockout();
  if (lockout.locked) {
    res.setHeader('Retry-After', String(lockout.retryAfterSeconds));
    return res.status(429).json({ error: `Забагато невдалих спроб. Спробуйте через ${Math.ceil(lockout.retryAfterSeconds / 60)} хв.` });
  }
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const override = await readPasswordOverride();
  const passwordValid = override ? passwordMatches(String(password || ''), override) : safeEqual(String(password || ''), process.env.ADMIN_PASSWORD);
  if (normalizedEmail !== expectedEmail() || !passwordValid) {
    await recordLoginFailure();
    return res.status(401).json({ error: 'Невірний email або пароль.' });
  }
  await clearLoginAttempts();
  res.setHeader('Set-Cookie', sessionCookieHeader(normalizedEmail));
  return res.status(200).json({ ok: true });
}
