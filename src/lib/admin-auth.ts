import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "imago_admin";

function adminLogin() {
  return process.env.ADMIN_LOGIN || "admin";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "admin";
}

function adminSecret() {
  return process.env.ADMIN_SECRET || "imago-dev-secret";
}

export function verifyCredentials(login: string, password: string) {
  return login === adminLogin() && password === adminPassword();
}

export function createSessionToken() {
  const payload = `admin:${Date.now()}`;
  const sig = createHmac("sha256", adminSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function isValidSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", adminSecret())
    .update(payload)
    .digest("hex");
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
