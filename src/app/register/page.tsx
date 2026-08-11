"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getRegistrationStatus, registerCopy } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";

type Step = 1 | 2;

export default function RegisterPage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const t = registerCopy[locale];
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+375",
    telegram: "",
    email: "",
    consent: false,
    needsLunch: null as boolean | null,
  });

  useEffect(() => {
    if (getRegistrationStatus() !== "open") {
      router.replace("/");
    }
  }, [router]);

  if (getRegistrationStatus() !== "open") {
    return (
      <AppShell>
        <p className="mt-20 text-center text-[14px] text-[#9da1ab]">{t.closed}</p>
      </AppShell>
    );
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function goNext(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.phone.trim() ||
      !form.email.trim()
    ) {
      setError(t.errRequired);
      return;
    }
    if (!form.consent) {
      setError(t.errConsent);
      return;
    }
    setStep(2);
  }

  async function submit() {
    setError("");
    if (form.needsLunch === null) {
      setError(t.errLunch);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
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
      setError(t.errSubmit);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      showBack
      backHref={step === 1 ? "/" : "/register"}
      onBack={step === 2 ? () => setStep(1) : undefined}
      headerRight={<LanguageSwitcher value={locale} onChange={setLocale} />}
    >
      {step === 1 ? (
        <form
          onSubmit={goNext}
          className="relative flex min-h-0 flex-1 flex-col pb-[68px]"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
            <h1 className="text-[18px] font-medium leading-6 text-[#eee]">
              {t.title}
            </h1>

            <div className="flex flex-col gap-6 pb-4">
              <Field
                label={t.firstName}
                placeholder={t.firstName}
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                required
                autoComplete="given-name"
              />
              <Field
                label={t.lastName}
                placeholder={t.lastName}
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                required
                autoComplete="family-name"
              />
              <Field
                label={t.phone}
                placeholder="+375"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
                inputMode="tel"
                autoComplete="tel"
              />
              <Field
                label={t.telegram}
                placeholder="@"
                value={form.telegram}
                onChange={(e) => update("telegram", e.target.value)}
                autoComplete="username"
              />
              <Field
                label={t.email}
                type="email"
                placeholder={t.email}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                autoComplete="email"
              />

              <label className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => update("consent", !form.consent)}
                  className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#eee] p-1"
                  aria-pressed={form.consent}
                  aria-label={t.consent}
                >
                  {form.consent ? (
                    <span className="block size-full rounded-[4px] bg-[#eee]" />
                  ) : null}
                </button>
                <span className="text-[12px] font-medium leading-5 text-[#9da1ab]">
                  {t.consent}
                </span>
              </label>
            </div>
          </div>

          {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

          <div className="absolute inset-x-0 bottom-0">
            <Button type="submit">{t.next}</Button>
          </div>
        </form>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col gap-6 pb-[68px]">
          <div className="flex flex-1 flex-col gap-6">
            <h1 className="text-[18px] font-medium leading-6 text-[#eee]">
              {t.lunchTitle}
            </h1>

            <div className="flex flex-col gap-3">
              <p className="text-[14px] font-medium leading-5 text-[#eee]">
                {t.lunchQuestion}
              </p>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={form.needsLunch === true ? "choiceActive" : "choice"}
                  onClick={() => update("needsLunch", true)}
                >
                  {t.yes}
                </Button>
                <Button
                  type="button"
                  variant={
                    form.needsLunch === false ? "choiceActive" : "choice"
                  }
                  onClick={() => update("needsLunch", false)}
                >
                  {t.no}
                </Button>
              </div>
            </div>
          </div>

          {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

          {form.needsLunch !== null ? (
            <div className="absolute inset-x-0 bottom-0">
              <Button type="button" onClick={submit} disabled={loading}>
                {loading ? t.saving : t.next}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
