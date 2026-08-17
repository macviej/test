export const DEVICE_STORAGE_KEY = "imago-device-id";
export const DEVICE_HEADER = "x-imago-device";

function randomDeviceId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getDeviceId() {
  try {
    const existing = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (existing && /^[a-zA-Z0-9_-]{16,64}$/.test(existing)) return existing;
    const next = randomDeviceId();
    localStorage.setItem(DEVICE_STORAGE_KEY, next);
    return next;
  } catch {
    return randomDeviceId();
  }
}

export function deviceHeaders(extra?: HeadersInit): HeadersInit {
  return {
    ...extra,
    [DEVICE_HEADER]: getDeviceId(),
  };
}
