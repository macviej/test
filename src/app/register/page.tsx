"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getRegistrationStatus, getWelcomeCopy, registerCopy } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";
import type { LunchType } from "@/lib/types";

type Step = 1 | 2 | 3 | 4;

export default function RegisterPage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const t = registerCopy[locale];
  const chips = getWelcomeCopy(locale, "open").chips;
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    telegram: "",
    email: "",
    consent: false,
    needsLunch: null as boolean | null,
    lunchType: null as LunchType | null,
    hasAllergy: null as boolean | null,
    allergyNote: "",
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

  function goBack() {
    setError("");
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  }

  function goNext(event?: FormEvent) {
    event?.preventDefault();
    setError("");

    if (step === 1) {
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
      return;
    }

    if (step === 2) {
      if (form.needsLunch === null) {
        setError(t.errLunch);
        return;
      }
      if (form.needsLunch) {
        if (!form.lunchType) {
          setError(t.errLunchKind);
          return;
        }
        if (form.hasAllergy === null) {
          setError(t.errAllergy);
          return;
        }
        if (form.hasAllergy && !form.allergyNote.trim()) {
          setError(t.errAllergyDetails);
          return;
        }
      }
      setStep(3);
      return;
    }

    setStep(4);
  }

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: `+375${form.phone.replace(/\D/g, "")}`,
          telegram: form.telegram.replace(/^@/, ""),
          lunchType: form.needsLunch ? form.lunchType : null,
          hasAllergy: form.needsLunch ? form.hasAllergy : null,
          allergyNote:
            form.needsLunch && form.hasAllergy ? form.allergyNote : "",
        }),
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

  const lunchLabel =
    form.needsLunch === null
      ? "—"
      : form.needsLunch
        ? [
            t.yes,
            form.lunchType === "vegan" ? t.lunchVegan : t.lunchStandard,
            form.hasAllergy
              ? `${t.lunchAllergyDetails}: ${form.allergyNote}`
              : t.no,
          ]
            .filter(Boolean)
            .join(" · ")
        : t.no;

  return (
    <AppShell
      showBack
      backHref="/"
      onBack={step === 1 ? undefined : goBack}
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
                prefix="+375"
                placeholder="291112233"
                value={form.phone}
                onChange={(e) => {
                  let digits = e.target.value.replace(/\D/g, "");
                  if (digits.startsWith("375")) digits = digits.slice(3);
                  if (digits.startsWith("80")) digits = digits.slice(2);
                  update("phone", digits);
                }}
                required
                inputMode="tel"
                autoComplete="tel-national"
              />
              <Field
                label={t.telegram}
                prefix="@"
                placeholder="username"
                value={form.telegram}
                onChange={(e) =>
                  update("telegram", e.target.value.replace(/^@+/, ""))
                }
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
      ) : null}

      {step === 2 ? (
        <div className="relative flex min-h-0 flex-1 flex-col gap-6 pb-[68px]">
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
            <h1 className="text-[18px] font-medium leading-6 text-[#eee]">
              {t.lunchTitle}
            </h1>

            <Choice
              question={t.lunchQuestion}
              yes={t.yes}
              no={t.no}
              value={form.needsLunch}
              onChange={(value) => {
                update("needsLunch", value);
                if (!value) {
                  update("lunchType", null);
                  update("hasAllergy", null);
                  update("allergyNote", "");
                }
              }}
            />

            {form.needsLunch ? (
              <>
                <div className="flex flex-col gap-3">
                  <p className="text-[14px] font-medium leading-5 text-[#eee]">
                    {t.lunchKind}
                  </p>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={
                        form.lunchType === "standard"
                          ? "choiceActive"
                          : "choice"
                      }
                      onClick={() => update("lunchType", "standard")}
                    >
                      {t.lunchStandard}
                    </Button>
                    <Button
                      type="button"
                      variant={
                        form.lunchType === "vegan" ? "choiceActive" : "choice"
                      }
                      onClick={() => update("lunchType", "vegan")}
                    >
                      {t.lunchVegan}
                    </Button>
                  </div>
                </div>

                <Choice
                  question={t.lunchAllergy}
                  yes={t.yes}
                  no={t.no}
                  value={form.hasAllergy}
                  onChange={(value) => {
                    update("hasAllergy", value);
                    if (!value) update("allergyNote", "");
                  }}
                />

                {form.hasAllergy ? (
                  <Field
                    label={t.lunchAllergyDetails}
                    placeholder={t.lunchAllergyDetails}
                    value={form.allergyNote}
                    onChange={(e) => update("allergyNote", e.target.value)}
                  />
                ) : null}
              </>
            ) : null}
          </div>

          {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

          {form.needsLunch !== null ? (
            <div className="absolute inset-x-0 bottom-0">
              <Button type="button" onClick={() => goNext()}>
                {t.next}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="relative flex min-h-0 flex-1 flex-col gap-6 pb-[68px]">
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
            <h1 className="text-[18px] font-medium leading-6 text-[#eee]">
              {t.extraTitle}
            </h1>
            <p className="whitespace-pre-line text-[14px] font-light leading-5 text-[#eee]">
              {t.extraBody}
            </p>
            <div className="flex flex-wrap content-start items-start gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[20px] border border-[#eee] px-4 py-2 text-[12px] font-medium leading-4 text-[#eee]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0">
            <Button type="button" onClick={() => goNext()}>
              {t.next}
            </Button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="relative flex min-h-0 flex-1 flex-col gap-6 pb-[68px]">
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
            <h1 className="text-[18px] font-medium leading-6 text-[#eee]">
              {t.reviewTitle}
            </h1>
            <div className="flex flex-col gap-3 text-[14px] font-light leading-5 text-[#eee]">
              <p>
                {form.firstName} {form.lastName}
              </p>
              <p>+375{form.phone}</p>
              {form.telegram ? <p>@{form.telegram}</p> : null}
              <p>{form.email}</p>
              <p>
                {t.lunchTitle}: {lunchLabel}
              </p>
            </div>
          </div>

          {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

          <div className="absolute inset-x-0 bottom-0">
            <Button type="button" onClick={submit} disabled={loading}>
              {loading ? t.saving : t.confirm}
            </Button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function Choice({
  question,
  yes,
  no,
  value,
  onChange,
}: {
  question: string;
  yes: string;
  no: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[14px] font-medium leading-5 text-[#eee]">{question}</p>
      <div className="flex gap-4">
        <Button
          type="button"
          variant={value === true ? "choiceActive" : "choice"}
          onClick={() => onChange(true)}
        >
          {yes}
        </Button>
        <Button
          type="button"
          variant={value === false ? "choiceActive" : "choice"}
          onClick={() => onChange(false)}
        >
          {no}
        </Button>
      </div>
    </div>
  );
}
