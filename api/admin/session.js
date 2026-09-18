import { readCookie, verifySession, SESSION_COOKIE } from './_auth.js';
export default function handler(req, res) { const session = verifySession(readCookie(req, SESSION_COOKIE)); return res.status(200).json({ authenticated: Boolean(session), email: session?.email || null }); }
