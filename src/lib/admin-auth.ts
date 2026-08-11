import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "imago_admin";

function isProdLike() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function adminLogin() {
  const value = process.env.ADMIN_LOGIN?.trim();
  if (value) return value;
  if (isProdLike()) return "";
  return "admin";
}

function adminPassword() {
  const value = process.env.ADMIN_PASSWORD?.trim();
  if (value) return value;
  if (isProdLike()) return "";
  return "admin";
}

function adminSecret() {
  const value = process.env.ADMIN_SECRET?.trim();
  if (value) return value;
  if (isProdLike()) return "";
  return "imago-dev-secret";
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyCredentials(login: string, password: string) {
  const expectedLogin = adminLogin();
  const expectedPassword = adminPassword();
  if (!expectedLogin || !expectedPassword) return false;
  if (!login || !password) return false;
  return safeEqual(login, expectedLogin) && safeEqual(password, expectedPassword);
}

export function createSessionToken() {
  const secret = adminSecret();
  if (!secret) {
    throw new Error("ADMIN_SECRET is not configured");
  }
  const payload = `admin:${Date.now()}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function isValidSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const secret = adminSecret();
  if (!secret) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return isValidSessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    throw new Error("UNAUTHORIZED");
  }
}
