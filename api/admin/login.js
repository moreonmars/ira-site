import crypto from 'node:crypto';

const expectedEmail = () => (process.env.ADMIN_EMAIL || 'irene.kharlamova@gmail.com').trim().toLowerCase();
const secret = () => process.env.ADMIN_SESSION_SECRET;
const sign = value => crypto.createHmac('sha256', secret()).update(value).digest('base64url');
const safeEqual = (left, right) => { const a = Buffer.from(left || ''); const b = Buffer.from(right || ''); return a.length === b.length && crypto.timingSafeEqual(a, b); };
const sessionCookie = email => { const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString('base64url'); return `${payload}.${sign(payload)}`; };

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.ADMIN_PASSWORD || !secret()) return res.status(503).json({ error: 'Admin auth is not configured yet.' });
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (normalizedEmail !== expectedEmail() || !safeEqual(String(password || ''), process.env.ADMIN_PASSWORD)) return res.status(401).json({ error: 'Невірний email або пароль.' });
  res.setHeader('Set-Cookie', `ira_admin_session=${sessionCookie(normalizedEmail)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
  return res.status(200).json({ ok: true });
}
