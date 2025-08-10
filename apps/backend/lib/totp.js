const crypto = require('crypto');

function intToBuffer(num) {
  const buf = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) { buf[i] = num & 0xff; num = num >> 8; }
  return buf;
}

function base32ToBuffer(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of base32.replace(/=+$/, '').toUpperCase()) {
    const val = alphabet.indexOf(c);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function hotp(secretBase32, counter, digits = 6) {
  const key = base32ToBuffer(secretBase32);
  const msg = intToBuffer(counter);
  const hmac = crypto.createHmac('sha1', key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  const otp = (code % 10 ** digits).toString().padStart(digits, '0');
  return otp;
}

function totp(secretBase32, timeStep = 30, digits = 6, t = Date.now()) {
  const counter = Math.floor(t / 1000 / timeStep);
  return hotp(secretBase32, counter, digits);
}

function verifyTOTP(secretBase32, token, window = 1, timeStep = 30, digits = 6, t = Date.now()) {
  token = String(token || '').padStart(digits, '0');
  const counter = Math.floor(t / 1000 / timeStep);
  for (let w = -window; w <= window; w++) {
    if (hotp(secretBase32, counter + w, digits) === token) return true;
  }
  return false;
}

module.exports = { totp, verifyTOTP };
