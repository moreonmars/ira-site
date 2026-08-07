import crypto from 'node:crypto';
import { del } from '@vercel/blob';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authenticated(req)) return res.status(401).json({ error: 'Вхід до адмінки потрібен для видалення.' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'Blob storage is not configured yet.' });
  const url = typeof req.body?.url === 'string' ? req.body.url : '';
  if (!url) return res.status(400).json({ error: 'Фото не знайдено.' });
  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Не вдалося видалити фото.' });
  }
}
