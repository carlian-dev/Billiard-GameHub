import crypto from 'node:crypto';

// Password hashing project standard: Node.js crypto.scrypt only. No extra dependency.
// Stored format carries the salt and scrypt parameters needed for verification:
//   scrypt:<keylen>:<N>:<r>:<p>:<salt>:<hash>
const SCRYPT_KEYLEN = 64;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

export function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password) {
  const salt = generateSalt();
  const hash = crypto
    .scryptSync(String(password), salt, SCRYPT_KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P })
    .toString('hex');
  return `scrypt:${SCRYPT_KEYLEN}:${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}:${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!password || typeof stored !== 'string') return false;
  const paramsMatch = stored.match(/^scrypt:(\d+):(\d+):(\d+):(\d+):([0-9a-f]+):([0-9a-f]+)$/);
  if (!paramsMatch) return false;
  const [, keylen, n, r, p, salt, expectedHex] = paramsMatch;
  const keylenNum = Number(keylen);
  if (!Number.isInteger(keylenNum) || keylenNum <= 0 || keylenNum > 256) return false;
  const params = {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  };
  const actual = crypto.scryptSync(String(password), salt, keylenNum, params).toString('hex');
  const actualBuf = Buffer.from(actual, 'hex');
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}