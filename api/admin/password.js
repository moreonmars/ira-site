import crypto from 'node:crypto';
import { list, put } from '@vercel/blob';

const authenticated = req => {
  const token = (req.headers.cookie || '').split(';').map(item => item.trim()).find(item => item.startsWith('ira_admin_session='))?.split('=').slice(1).join('=');
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(signature); const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); } catch { return false; }
};

const readOverride = async () => {
  const result = await list({ prefix: 'ira-settings/admin-password', token: process.env.BLOB_READ_WRITE_TOKEN });
  const blob = result.blobs.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0];
  if (!blob) return null;
  const response = await fetch(blob.url);
  return response.ok ? response.json() : null;
};

const matches = (password, record) => {
  if (!record?.salt || !record?.hash) return false;
  const hash = crypto.scryptSync(password, Buffer.from(record.salt, 'base64'), 32);
  return crypto.timingSafeEqual(hash, Buffer.from(record.hash, 'base64'));
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authenticated(req)) return res.status(401).json({ error: 'Увійдіть до адмінки.' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'Сховище не налаштоване.' });
  const current = String(req.body?.currentPassword || '');
  const next = String(req.body?.newPassword || '');
  if (next.length < 8) return res.status(400).json({ error: 'Новий пароль має містити щонайменше 8 символів.' });
  try {
    const override = await readOverride();
    const configured = Buffer.from(process.env.ADMIN_PASSWORD || '');
    const entered = Buffer.from(current);
    const currentValid = override ? matches(current, override) : entered.length === configured.length && crypto.timingSafeEqual(entered, configured);
    if (!currentValid) return res.status(401).json({ error: 'Поточний пароль неправильний.' });
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(next, salt, 32);
    await put('ira-settings/admin-password.json', JSON.stringify({ version: 1, salt: salt.toString('base64'), hash: hash.toString('base64'), updatedAt: new Date().toISOString() }), { access: 'public', addRandomSuffix: false, contentType: 'application/json', token: process.env.BLOB_READ_WRITE_TOKEN });
    return res.status(200).json({ ok: true });
  } catch (error) { return res.status(500).json({ error: error.message || 'Не вдалося змінити пароль.' }); }
}
