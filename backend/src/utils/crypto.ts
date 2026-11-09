import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export function hashPassword(plainPassword: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = pbkdf2Sync(
    plainPassword,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    DIGEST,
  ).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(
  plainPassword: string,
  storedHash: string,
): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) {
    return false;
  }
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) {
    return false;
  }
  const derivedBuffer = pbkdf2Sync(
    plainPassword,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    DIGEST,
  );
  const storedBuffer = Buffer.from(keyHex, "hex");
  if (derivedBuffer.length !== storedBuffer.length) {
    return false;
  }
  return timingSafeEqual(derivedBuffer, storedBuffer);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}
