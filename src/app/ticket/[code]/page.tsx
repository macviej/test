"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";

type TicketPayload = {
  participant: {
    code: string;
    firstName: string;
    lastName: string;
  };
  qrDataUrl: string;
};

export default function TicketPage() {
  const params = useParams<{ code: string }>();
  const [data, setData] = useState<TicketPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/ticket/${params.code}`);
        const json = await response.json();
        if (!response.ok) {
          setError(json.error || "Билет не найден");
          return;
        }
        setData(json);
      } catch {
        setError("Не удалось загрузить QR");
      } finally {
        setLoading(false);
      }
    }
    if (params.code) load();
  }, [params.code]);

  return (
    <AppShell showBack backHref="/">
      <div className="flex flex-1 flex-col items-center text-center">
        {loading ? (
          <p className="mt-20 text-[14px] text-[#9da1ab]">Загрузка...</p>
        ) : error ? (
          <p className="mt-20 text-[14px] text-[#d15a32]">{error}</p>
        ) : data ? (
          <>
            <div className="mb-10 flex w-full flex-col gap-4">
              <h1 className="text-[24px] font-medium leading-7 text-[#eee]">
                Спасибо за регистрацию
              </h1>
              <p className="text-[14px] font-light leading-5 text-[#eee]">
                Этот QR-код — твой пропуск на конференцию. Покажи его на стойке
                регистрации или назови последние 3 цифры кода.
              </p>
            </div>

            <div className="mb-8 flex flex-col items-center gap-4">
              <div className="rounded-2xl bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.qrDataUrl}
                  alt={`QR ${data.participant.code}`}
                  className="size-[240px]"
                />
              </div>
              <p className="text-[22px] font-medium tracking-wide text-[#eee]">
                #{data.participant.code}
              </p>
            </div>

            <Button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Imago Dei Conf 2026",
                    text: `Мой код: #${data.participant.code}`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              Поделиться
            </Button>

            <Link href="/qa" className="mt-3 w-full">
              <Button type="button" variant="choice">
                Перейти к Q&A
              </Button>
            </Link>

            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="text-[14px] font-medium text-[#eee]">
                Не получается прийти?
              </p>
              <Button
                variant="ghost"
                type="button"
                onClick={() =>
                  alert("Отмена регистрации будет доступна позже")
                }
              >
                Отменить регистрацию
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
