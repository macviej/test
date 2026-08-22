"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { findTicketCopy } from "@/lib/i18n";
import {
  BY_PHONE_PREFIX,
  formatNationalPhone,
  nationalPhoneDigits,
  toStoredByPhone,
} from "@/lib/phone";
import { useLocale } from "@/lib/use-locale";

export default function FindTicketPage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const t = findTicketCopy[locale];
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!lastName.trim() || !phone.trim()) {
      setError(t.errRequired);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ticket/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastName, phone: toStoredByPhone(phone) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.errGeneric);
        return;
      }

      localStorage.setItem(
        "imago-ticket",
        JSON.stringify({
          code: data.participant.code,
          firstName: data.participant.firstName,
        }),
      );
      router.push(`/ticket/${data.participant.code}`);
    } catch {
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      showBack
      backHref="/"
      headerRight={<LanguageSwitcher value={locale} onChange={setLocale} />}
    >
      <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-8 pb-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-[18px] font-medium leading-6 text-[#eee]">
            {t.title}
          </h1>
          <p className="text-[14px] font-light leading-5 text-[#9da1ab]">
            {t.hint}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <Field
            label={t.lastName}
            placeholder={t.lastName}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            required
          />
          <Field
            label={t.phone}
            prefix={`${BY_PHONE_PREFIX} `}
            placeholder="29 123 45 67"
            type="tel"
            inputMode="tel"
            value={formatNationalPhone(phone)}
            onChange={(e) => setPhone(nationalPhoneDigits(e.target.value))}
            autoComplete="tel"
            required
          />
        </div>

        {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

        <div className="mt-auto">
          <Button type="submit" disabled={loading}>
            {loading ? t.loading : t.submit}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
