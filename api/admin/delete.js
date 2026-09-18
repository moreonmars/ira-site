import { del } from '@vercel/blob';
import { authenticated } from './_auth.js';

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
