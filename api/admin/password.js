import crypto from 'node:crypto';
import { put } from '@vercel/blob';
import { authenticated, readPasswordOverride, passwordMatches, safeEqual } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authenticated(req)) return res.status(401).json({ error: 'Увійдіть до адмінки.' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'Сховище не налаштоване.' });
  const current = String(req.body?.currentPassword || '');
  const next = String(req.body?.newPassword || '');
  if (next.length < 8) return res.status(400).json({ error: 'Новий пароль має містити щонайменше 8 символів.' });
  try {
    const override = await readPasswordOverride();
    const currentValid = override ? passwordMatches(current, override) : safeEqual(current, process.env.ADMIN_PASSWORD || '');
    if (!currentValid) return res.status(401).json({ error: 'Поточний пароль неправильний.' });
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(next, salt, 32);
    await put('ira-settings/admin-password.json', JSON.stringify({ version: 1, salt: salt.toString('base64'), hash: hash.toString('base64'), updatedAt: new Date().toISOString() }), { access: 'public', addRandomSuffix: false, contentType: 'application/json', token: process.env.BLOB_READ_WRITE_TOKEN });
    return res.status(200).json({ ok: true });
  } catch (error) { return res.status(500).json({ error: error.message || 'Не вдалося змінити пароль.' }); }
}
