import crypto from 'node:crypto';
import { list } from '@vercel/blob';

export const SESSION_COOKIE = 'ira_admin_session';

const sign = value => crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(value).digest('base64url');

export const safeEqual = (left, right) => {
  const a = Buffer.from(left || '');
  const b = Buffer.from(right || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const readCookie = (req, name) => (req.headers.cookie || '')
  .split(';')
  .map(item => item.trim())
  .find(item => item.startsWith(`${name}=`))
  ?.split('=').slice(1).join('=');

export const verifySession = token => {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  if (!safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
};

export const authenticated = req => Boolean(verifySession(readCookie(req, SESSION_COOKIE)));

export const sessionCookieHeader = email => {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;
};

export const readPasswordOverride = async () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const result = await list({ prefix: 'ira-settings/admin-password', token: process.env.BLOB_READ_WRITE_TOKEN });
  const blob = result.blobs.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0];
  if (!blob) return null;
  const response = await fetch(blob.url);
  return response.ok ? response.json() : null;
};

export const passwordMatches = (password, record) => {
  if (!record?.salt || !record?.hash) return false;
  const hash = crypto.scryptSync(password, Buffer.from(record.salt, 'base64'), 32);
  const expected = Buffer.from(record.hash, 'base64');
  return hash.length === expected.length && crypto.timingSafeEqual(hash, expected);
};
