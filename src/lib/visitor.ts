import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const VISITOR_COOKIE = "imago_visitor";
export const DEVICE_HEADER = "x-imago-device";

const DEVICE_ID_RE = /^[a-zA-Z0-9_-]{16,64}$/;

export function isValidDeviceId(value: string | null | undefined): value is string {
  return Boolean(value && DEVICE_ID_RE.test(value));
}

function uniqueKeys(keys: Array<string | null | undefined>) {
  return [...new Set(keys.filter(isValidDeviceId))];
}

export type ViewerIdentity = {
  key: string;
  aliases: string[];
  setCookie: boolean;
};

export async function getViewerIdentity(
  request?: Request,
): Promise<ViewerIdentity> {
  const jar = await cookies();
  const cookieKey = jar.get(VISITOR_COOKIE)?.value;
  const headerKey = request?.headers.get(DEVICE_HEADER) ?? "";
  const deviceKey = isValidDeviceId(headerKey) ? headerKey : "";

  if (isValidDeviceId(cookieKey)) {
    return {
      key: cookieKey,
      aliases: uniqueKeys([cookieKey, deviceKey]),
      setCookie: false,
    };
  }

  if (deviceKey) {
    return { key: deviceKey, aliases: [deviceKey], setCookie: true };
  }

  const key = randomBytes(16).toString("hex");
  return { key, aliases: [key], setCookie: true };
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

export function applyVisitorCookie(
  response: NextResponse,
  identity: { key: string; setCookie: boolean },
) {
  if (!identity.setCookie) return response;
  const opts = visitorCookieOptions(identity.key);
  response.cookies.set(opts.name, opts.value, opts);
  return response;
}
