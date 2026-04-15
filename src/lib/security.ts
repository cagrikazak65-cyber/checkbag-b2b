import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const PASSWORD_PREFIX = "scrypt";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export const SESSION_COOKIE = "checkbag_session";

type SessionRole = "admin" | "customer";

function base64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function sessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET production ortamında zorunludur.");
  }

  return secret || "checkbag-dev-session-secret-change-me";
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${PASSWORD_PREFIX}:${salt}:${hash}`;
}

export function isPasswordHash(value: string) {
  return value.startsWith(`${PASSWORD_PREFIX}:`);
}

export function verifyPassword(password: string, storedPassword: string) {
  if (!isPasswordHash(storedPassword)) {
    return password === storedPassword;
  }

  const [, salt, hash] = storedPassword.split(":");

  if (!salt || !hash) {
    return false;
  }

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");

  if (candidate.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(candidate, expected);
}

function sign(payload: string) {
  return base64Url(createHmac("sha256", sessionSecret()).update(payload).digest());
}

export function createSessionToken(userId: number): string;
export function createSessionToken(userId: number, role: SessionRole): string;
export function createSessionToken(userId: number, role?: SessionRole) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = role ? `${userId}.${role}.${expiresAt}` : `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  const signature = parts.pop();
  const [rawUserId, rawRoleOrExpiresAt, rawExpiresAtWithRole] = parts;

  if (!rawUserId || !rawRoleOrExpiresAt || !signature) {
    return null;
  }

  const payload = parts.join(".");

  if (sign(payload) !== signature) {
    return null;
  }

  const userId = Number(rawUserId);
  const role = rawExpiresAtWithRole ? rawRoleOrExpiresAt : null;
  const rawExpiresAt = rawExpiresAtWithRole ?? rawRoleOrExpiresAt;
  const expiresAt = Number(rawExpiresAt);

  if (!Number.isInteger(userId) || !Number.isInteger(expiresAt)) {
    return null;
  }

  if (role !== null && role !== "admin" && role !== "customer") {
    return null;
  }

  if (expiresAt < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return { userId, role, expiresAt };
}

export const sessionMaxAge = SESSION_TTL_SECONDS;

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
