import { createHash, createHmac, randomBytes } from "node:crypto";

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function encodeBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

export function decodeBase32(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_CHARS.indexOf(clean[i]);
    if (idx === -1) {
      throw new Error(`Invalid Base32 character: ${clean[i]}`);
    }
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function generateTotpSecret(length = 20): string {
  return encodeBase32(randomBytes(length));
}

export function generateTotpCode(
  secret: string,
  timestampMs = Date.now(),
  stepSeconds = 30,
): string {
  const timeStep = Math.floor(Math.floor(timestampMs / 1000) / stepSeconds);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(timeStep));

  const keyBuffer = decodeBase32(secret);
  const hmac = createHmac("sha1", keyBuffer).update(timeBuffer).digest();

  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1_000_000;
  return otp.toString().padStart(6, "0");
}

export function verifyTotpCode(
  code: string,
  secret: string,
  windowSteps = 1,
  currentTimestampMs = Date.now(),
  stepSeconds = 30,
): boolean {
  const normalizedCode = code.trim().replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalizedCode)) {
    return false;
  }

  const currentStep = Math.floor(
    Math.floor(currentTimestampMs / 1000) / stepSeconds,
  );

  for (let i = -windowSteps; i <= windowSteps; i++) {
    const step = currentStep + i;
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigUInt64BE(BigInt(step));

    const keyBuffer = decodeBase32(secret);
    const hmac = createHmac("sha1", keyBuffer).update(timeBuffer).digest();

    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const stepOtp = (binary % 1_000_000).toString().padStart(6, "0");
    if (stepOtp === normalizedCode) {
      return true;
    }
  }

  return false;
}

export function generateTotpUri(
  email: string,
  secret: string,
  issuer = "CafeStock Roastery",
): string {
  const cleanIssuer = encodeURIComponent(issuer);
  const cleanEmail = encodeURIComponent(email);
  return `otpauth://totp/${cleanIssuer}:${cleanEmail}?secret=${secret}&issuer=${cleanIssuer}&algorithm=SHA1&digits=6&period=30`;
}

export function generateBackupCodes(count = 8): {
  plainCodes: string[];
  hashedCodes: string[];
} {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const raw = randomBytes(4).toString("hex").toUpperCase();
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
    plainCodes.push(formatted);

    const hash = createHash("sha256").update(formatted).digest("hex");
    hashedCodes.push(hash);
  }

  return { plainCodes, hashedCodes };
}

export function hashBackupCode(code: string): string {
  const normalized = code.trim().toUpperCase();
  return createHash("sha256").update(normalized).digest("hex");
}
