"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";

type Step = 1 | 2;

export default function RegisterPage() {
  const router = useRouter();
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

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function goNext(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Заполните все обязательные поля");
      return;
    }
    if (!form.consent) {
      setError("Нужно согласие на обработку данных");
      return;
    }
    setStep(2);
  }

  async function submit() {
    setError("");
    if (form.needsLunch === null) {
      setError("Выберите вариант с обедом");
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
        setError(data.error || "Ошибка регистрации");
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
      setError("Не удалось отправить форму");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell showBack={step === 1} backHref="/">
      {step === 1 ? (
        <form onSubmit={goNext} className="flex flex-1 flex-col gap-6 pb-20">
          <h1 className="text-[18px] font-medium leading-6 text-[#eee]">
            Общая информация
          </h1>

          <div className="flex flex-col gap-6">
            <Field
              label="Имя"
              placeholder="Имя"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
            <Field
              label="Фамилия"
              placeholder="Фамилия"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
            <Field
              label="Номер телефона"
              placeholder="+375"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
            />
            <Field
              label="Никнейм в Телеграм"
              placeholder="@"
              value={form.telegram}
              onChange={(e) => update("telegram", e.target.value)}
            />
            <Field
              label="E-mail"
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />

            <label className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => update("consent", !form.consent)}
                className="flex size-6 items-center justify-center rounded-lg border border-[#eee] p-1"
                aria-pressed={form.consent}
              >
                {form.consent ? (
                  <span className="block size-full rounded-[4px] bg-[#eee]" />
                ) : null}
              </button>
              <span className="text-[12px] font-medium leading-5 text-[#9da1ab]">
                Я согласен с обработкой данных
              </span>
            </label>
          </div>

          {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

          <div className="mt-auto">
            <Button type="submit">Далее</Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-1 flex-col gap-6">
          <button
            type="button"
            className="self-start text-[13px] text-[#9da1ab]"
            onClick={() => setStep(1)}
          >
            ← Назад
          </button>

          <h1 className="text-[18px] font-medium leading-6 text-[#eee]">Обед</h1>

          <div className="flex flex-col gap-3">
            <p className="text-[14px] font-medium leading-5 text-[#eee]">
              Нужен ли вам обед?
            </p>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={form.needsLunch === true ? "choiceActive" : "choice"}
                onClick={() => update("needsLunch", true)}
              >
                Да
              </Button>
              <Button
                type="button"
                variant={form.needsLunch === false ? "choiceActive" : "choice"}
                onClick={() => update("needsLunch", false)}
              >
                Нет
              </Button>
            </div>
          </div>

          {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

          <div className="mt-auto">
            <Button type="button" onClick={submit} disabled={loading}>
              {loading ? "Сохраняем..." : "Завершить"}
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
