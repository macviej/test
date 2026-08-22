"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Field, SelectField, TextAreaField } from "@/components/Field";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Stage } from "@/components/Stage";
import { getRegistrationStatus, registerCopy } from "@/lib/i18n";
import {
  BY_PHONE_PREFIX,
  formatFullByPhone,
  formatNationalPhone,
  nationalPhoneDigits,
  toStoredByPhone,
} from "@/lib/phone";
import { useLocale } from "@/lib/use-locale";
import type { HowHeard, LunchType } from "@/lib/types";

type Step = 1 | 2 | 3 | 4;

const HOW_HEARD: HowHeard[] = ["social", "church", "friends", "other"];

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
    phone: "",
    telegram: "",
    email: "",
    consent: false,
    needsLunch: null as boolean | null,
    lunchType: null as LunchType | null,
    hasAllergy: null as boolean | null,
    allergyNote: "",
    city: "",
    church: "",
    howHeard: "" as HowHeard | "",
    extraInfo: "",
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
        nationalPhoneDigits(form.phone).length < 9 ||
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
          phone: toStoredByPhone(form.phone),
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

  const extraSummary = [form.city, form.church, form.howHeard ? t.extraHowHeardOptions[form.howHeard] : ""]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");

  return (
    <AppShell
      showBack
      backHref="/"
      onBack={step === 1 ? undefined : goBack}
      headerRight={<LanguageSwitcher value={locale} onChange={setLocale} />}
    >
      <Stage id={step} className="flex min-h-0 flex-1 flex-col">
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
                prefix={`${BY_PHONE_PREFIX} `}
                placeholder="29 123 45 67"
                value={formatNationalPhone(form.phone)}
                onChange={(e) => update("phone", nationalPhoneDigits(e.target.value))}
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

              <div className="flex items-center gap-3">
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
                <button
                  type="button"
                  onClick={() => update("consent", !form.consent)}
                  className="text-left text-[12px] font-medium leading-5 text-[#9da1ab]"
                >
                  {t.consent}
                </button>
              </div>
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
            <p className="whitespace-pre-line text-[12px] font-light leading-4 text-[#9da1ab]">
              {t.lunchPriceNote}
            </p>

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
                  <p className="whitespace-pre-line text-[12px] font-light leading-4 text-[#9da1ab]">
                    {t.lunchKindHint}
                  </p>
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
            <Field
              label={t.extraCity}
              placeholder={t.extraCity}
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
            <Field
              label={t.extraChurch}
              placeholder={t.extraChurch}
              value={form.church}
              onChange={(e) => update("church", e.target.value)}
            />
            <SelectField
              label={t.extraHowHeard}
              placeholder={t.extraHowHeardPlaceholder}
              value={form.howHeard}
              onChange={(e) => update("howHeard", e.target.value as HowHeard)}
              options={HOW_HEARD.map((value) => ({
                value,
                label: t.extraHowHeardOptions[value],
              }))}
            />
            <TextAreaField
              label={t.extraNote}
              placeholder={t.extraNote}
              hint={t.extraNoteHint}
              value={form.extraInfo}
              onChange={(e) => update("extraInfo", e.target.value)}
            />
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
            <div className="flex flex-col gap-4 text-[14px] font-light leading-5 text-[#eee]">
              <div className="flex flex-col gap-2">
                <p className="text-[14px] font-medium">{t.reviewData}</p>
                <p>
                  {form.firstName} {form.lastName}
                </p>
                <p>{formatFullByPhone(form.phone)}</p>
                {form.telegram ? <p>@{form.telegram}</p> : null}
                <p>{form.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[14px] font-medium">{t.lunchTitle}</p>
                {form.needsLunch ? (
                  <>
                    <p>
                      {form.lunchType === "vegan" ? t.lunchVegan : t.lunchStandard}
                    </p>
                    <p>
                      {form.hasAllergy
                        ? `${t.lunchAllergyDetails}: ${form.allergyNote}`
                        : `${t.lunchAllergy}: ${t.no}`}
                    </p>
                  </>
                ) : (
                  <p>{t.no}</p>
                )}
              </div>
              {extraSummary || form.extraInfo ? (
                <div className="flex flex-col gap-2">
                  <p className="text-[14px] font-medium">{t.reviewExtra}</p>
                  {extraSummary ? <p>{extraSummary}</p> : null}
                  {form.extraInfo ? <p>{form.extraInfo}</p> : null}
                </div>
              ) : null}
            </div>
            <p className="text-[12px] font-light leading-4 text-[#9da1ab]">
              {t.donationNote}
            </p>
          </div>

          {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

          <div className="absolute inset-x-0 bottom-0">
            <Button type="button" onClick={submit} disabled={loading}>
              {loading ? t.saving : t.confirm}
            </Button>
          </div>
        </div>
      ) : null}
      </Stage>
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
