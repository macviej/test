export const BY_PHONE_PREFIX = "+375";

export function nationalPhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("375")) digits = digits.slice(3);
  if (digits.startsWith("80")) digits = digits.slice(2);
  return digits.slice(0, 9);
}

export function formatNationalPhone(value: string): string {
  const digits = nationalPhoneDigits(value);
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean);
  return parts.join(" ");
}

export function toStoredByPhone(value: string): string {
  const digits = nationalPhoneDigits(value);
  return digits ? `${BY_PHONE_PREFIX}${digits}` : "";
}

export function formatFullByPhone(value: string): string {
  const national = formatNationalPhone(value);
  return national ? `${BY_PHONE_PREFIX} ${national}` : BY_PHONE_PREFIX;
}
