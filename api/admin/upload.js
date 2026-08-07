import crypto from 'node:crypto';
import { put } from '@vercel/blob';

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

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authenticated(req)) return res.status(401).json({ error: 'Вхід до адмінки потрібен для завантаження.' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'Blob storage is not configured yet.' });
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    const match = contentType.match(/boundary=([^;]+)/);
    if (!match) return res.status(400).json({ error: 'Invalid upload.' });
    const boundary = Buffer.from(`--${match[1].replace(/^"|"$/g, '')}`);
    const parts = body.toString('binary').split(boundary.toString('binary'));
    const filePart = parts.find(part => /filename="/.test(part));
    if (!filePart) return res.status(400).json({ error: 'Файл не знайдено.' });
    const headerEnd = filePart.indexOf('\r\n\r\n');
    const header = filePart.slice(0, headerEnd);
    const filename = (header.match(/filename="([^"]*)"/)?.[1] || 'image').replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase();
    const type = header.match(/Content-Type:\s*([^\r\n]+)/i)?.[1] || 'application/octet-stream';
    const fileBody = Buffer.from(filePart.slice(headerEnd + 4, filePart.endsWith('\r\n') ? -2 : undefined), 'binary');
    if (!type.startsWith('image/') && type !== 'application/pdf') return res.status(415).json({ error: 'Дозволені зображення або PDF.' });
    if (fileBody.length > 4 * 1024 * 1024) return res.status(413).json({ error: 'Файл завеликий. Максимум 4 MB.' });
    const blob = await put(`ira-portfolio/${Date.now()}-${crypto.randomUUID()}-${filename}`, fileBody, { access: 'public', contentType: type, token: process.env.BLOB_READ_WRITE_TOKEN });
    return res.status(200).json({ url: blob.url, pathname: blob.pathname });
  } catch (error) { return res.status(500).json({ error: error.message || 'Upload failed.' }); }
}
