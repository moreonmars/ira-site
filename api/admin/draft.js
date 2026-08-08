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

const encryptionKey = () => crypto.createHash('sha256').update(process.env.ADMIN_SESSION_SECRET).digest();
const encrypt = value => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return JSON.stringify({ iv: iv.toString('base64url'), tag: cipher.getAuthTag().toString('base64url'), data: encrypted.toString('base64url') });
};
const decrypt = value => {
  const payload = JSON.parse(value);
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(payload.iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64url'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64url')), decipher.final()]).toString('utf8'));
};

const latestDraft = async () => {
  const result = await list({ prefix: 'ira-settings/draft.json', token: process.env.BLOB_READ_WRITE_TOKEN });
  const blob = result.blobs.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0];
  if (!blob) return null;
  const response = await fetch(blob.url);
  return response.ok ? decrypt(await response.text()) : null;
};

const migrateLegacyGalleries = async draft => {
  if (!draft || draft.version !== 1) return draft;
  try {
    const response = await fetch('https://irakharlamova.com/content.json', { cache: 'no-store' });
    if (!response.ok) return draft;
    const published = await response.json();
    const publishedById = new Map((published.works || []).map(work => [work.id, work]));
    let changed = false;
    const works = (draft.works || []).map(work => {
      const source = publishedById.get(work.id);
      const current = String(work.gallery || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean);
      const complete = String(source?.gallery || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean);
      const isLegacySubset = complete.length > current.length && current.every(item => complete.includes(item));
      if (!isLegacySubset) return work;
      changed = true;
      return { ...work, gallery: source.gallery };
    });
    if (!changed) return { ...draft, version: 2 };
    const migrated = { ...draft, version: 2, works, updatedAt: new Date().toISOString() };
    return migrated;
  } catch {
    return draft;
  }
};

export default async function handler(req, res) {
  if (!authenticated(req)) return res.status(401).json({ error: 'Увійдіть до адмінки.' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'Сховище не налаштоване.' });
  try {
    if (req.method === 'GET') return res.status(200).json({ draft: await migrateLegacyGalleries(await latestDraft()) });
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const payload = { version: 2, updatedAt: new Date().toISOString(), works: req.body?.works || [], profile: req.body?.profile || {} };
    await put('ira-settings/draft.json', encrypt(JSON.stringify(payload)), { access: 'public', addRandomSuffix: false, contentType: 'application/json', token: process.env.BLOB_READ_WRITE_TOKEN });
    return res.status(200).json({ ok: true });
  } catch (error) { return res.status(500).json({ error: error.message || 'Не вдалося зберегти чернетку.' }); }
}
