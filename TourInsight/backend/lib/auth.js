import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { readDb, publicUser } from './store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-change-me';
export const COOKIE_NAME = 'tourinsight_session';

export function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });
}
export function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}
export function tokenHash(token) { return crypto.createHash('sha256').update(String(token || '')).digest('hex'); }
export function randomToken(bytes = 32) { return crypto.randomBytes(bytes).toString('hex'); }
export function otpCode() { return String(Math.floor(100000 + Math.random() * 900000)); }
export function otpHash(code) { return tokenHash(code); }

export async function optionalUser(req) {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  const cookie = req.cookies?.[COOKIE_NAME] || '';
  const db = await readDb();
  for (const token of [bearer, cookie]) {
    if (!token) continue;
    const payload = verifyToken(token);
    if (!payload?.sub) continue;
    const user = db.User.find((u) => u.id === payload.sub && u.verified !== false);
    if (user) return user;
  }
  return null;
}
export async function requireUser(req, res, next) {
  const user = await optionalUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required', reason: 'auth_required' });
  req.user = user;
  next();
}
export function setSession(res, token) {
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
}
export function clearSession(res) { res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }); }
export function safeReturnTo(value) {
  const s = String(value || '/');
  if (!s.startsWith('/') || s.startsWith('//') || s.includes('\\')) return '/';
  return s;
}
export { publicUser };
