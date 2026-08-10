import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export const VISITOR_COOKIE = "imago_visitor";

export async function getOrCreateVisitorKey() {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value;
  if (existing) return { key: existing, setCookie: false as const };

  const key = randomBytes(12).toString("hex");
  return { key, setCookie: true as const };
}

export function visitorCookieOptions(key: string) {
  return {
    name: VISITOR_COOKIE,
    value: key,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
  };
}

export async function readVisitorKey() {
  const jar = await cookies();
  return jar.get(VISITOR_COOKIE)?.value || "";
}
