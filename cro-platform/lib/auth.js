// Authentication: scrypt password hashing + stateless HMAC-signed session
// tokens in an HttpOnly cookie. Zero dependencies (node:crypto).
//
// MVP model: one shared workspace — any signed-in user can access the
// workspace data. Sites record their creator (ownerId) so per-account
// isolation can be added later without a migration.
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SESSION_TTL_MS = 30 * 24 * 3600e3; // 30 days
const COOKIE_NAME = 'cro_session';

// ---- password hashing ----

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expected] = parts;
  const actual = crypto.scryptSync(String(password), salt, 64).toString('hex');
  const a = Buffer.from(actual, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---- session secret (env override, else persisted alongside the data file) ----

function loadSecret(dataFile) {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const secretPath = path.join(path.dirname(dataFile), 'session-secret.key');
  try {
    return fs.readFileSync(secretPath, 'utf8').trim();
  } catch {
    const secret = crypto.randomBytes(32).toString('hex');
    fs.mkdirSync(path.dirname(secretPath), { recursive: true });
    fs.writeFileSync(secretPath, secret, { mode: 0o600 });
    return secret;
  }
}

// ---- session tokens: userId.expiryMs.hmac ----

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function createSession(userId, secret, ttlMs = SESSION_TTL_MS) {
  const payload = `${userId}.${Date.now() + ttlMs}`;
  return `${payload}.${sign(payload, secret)}`;
}

function verifySession(token, secret) {
  if (!token) return null;
  const idx = token.lastIndexOf('.');
  if (idx === -1) return null;
  const payload = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  const expected = sign(payload, secret);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const [userId, expiry] = payload.split('.');
  if (!userId || Number(expiry) < Date.now()) return null;
  return userId;
}

// ---- cookie helpers ----

function sessionCookie(token) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
}

function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function tokenFromRequest(req) {
  const cookies = req.headers.cookie || '';
  for (const part of cookies.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE_NAME) return rest.join('=');
  }
  return null;
}

function validEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = {
  COOKIE_NAME, SESSION_TTL_MS,
  hashPassword, verifyPassword,
  loadSecret, createSession, verifySession,
  sessionCookie, clearCookie, tokenFromRequest,
  validEmail,
};
