import crypto from 'crypto';

export function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

export function sanitizeString(str) {
  return str.replace(/[<>]/g, '');
}

export function formatTimestamp(date) {
  return date.toLocaleString();
}

export function isValidUsername(username) {
  return username && 
         typeof username === 'string' && 
         username.trim().length >= 2 && 
         username.trim().length <= 20 &&
         /^[a-zA-Z0-9_-]+$/.test(username.trim());
}