"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";

type TicketPayload = {
  participant: {
    code: string;
    firstName: string;
    lastName: string;
    phone: string;
    telegram: string;
    email: string;
    needsLunch: boolean | null;
  };
  qrDataUrl: string;
};

export default function TicketPage() {
  const params = useParams<{ code: string }>();
  const [data, setData] = useState<TicketPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

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

  function inviteFriend() {
    if (!data) return;
    if (navigator.share) {
      navigator.share({
        title: "Imago Dei Conf 2026",
        text: "Присоединяйся к Imago Dei Conf 2026!",
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert("Ссылка скопирована");
    }
  }

  const p = data?.participant;

  return (
    <AppShell
      headerRight={
        <button
          type="button"
          className="flex size-[30px] items-center justify-center"
          aria-label="Информация"
          onClick={() => setInfoOpen(true)}
          disabled={!data}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/info.svg" alt="" className="size-[30px]" />
        </button>
      }
    >
      <div className="relative flex flex-1 flex-col">
        {loading ? (
          <p className="mt-20 text-center text-[14px] text-[#9da1ab]">
            Загрузка...
          </p>
        ) : error ? (
          <p className="mt-20 text-center text-[14px] text-[#d15a32]">{error}</p>
        ) : data && p ? (
          <>
            <div className="flex min-h-[568px] flex-1 flex-col">
              <div className="flex flex-col gap-4 text-center">
                <h1 className="text-[20px] font-semibold uppercase leading-7 text-[#eee]">
                  Спасибо за регистрацию
                </h1>
                <p className="text-[14px] font-light leading-5 text-[#eee]">
                  Этот QR-код — твой пропуск на конференцию. Покажи его на стойке
                  регистрации или назови последние 3 цифры кода.
                </p>
              </div>

              <div className="mx-auto mt-10 flex w-[240px] flex-col items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.qrDataUrl}
                  alt={`QR ${p.code}`}
                  className="size-[240px]"
                />
                <p className="text-center text-[20px] font-semibold uppercase leading-7 text-[#eee]">
                  #{p.code}
                </p>
              </div>

              <div className="mt-auto">
                <Button type="button" arrow onClick={inviteFriend}>
                  Пригласить друга
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-1 text-center">
              <p className="w-full text-[14px] font-light leading-5 text-[#eee]">
                Не получается прийти?
              </p>
              <Button
                variant="textArrow"
                arrow
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

        {infoOpen && p ? (
          <div className="absolute inset-0 z-20 flex items-start justify-center pt-2">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Закрыть"
              onClick={() => setInfoOpen(false)}
            />
            <div className="relative z-10 w-full overflow-hidden rounded-[28px] border border-[#eee]/20 bg-[#0b1020]/95 px-5 py-5 shadow-[0_0_40px_rgba(20,76,205,0.35)] backdrop-blur-md">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Боровляны, Первомайская 23",
                    "30 BYN",
                    "7 ноября",
                    "10:00",
                  ].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-[20px] border border-[#eee] px-4 py-2 text-[12px] font-medium leading-4 text-[#eee]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setInfoOpen(false)}
                  className="flex size-6 shrink-0 items-center justify-center text-[18px] leading-none text-[#eee]"
                  aria-label="Закрыть"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <h2 className="text-center text-[18px] font-medium uppercase leading-6 text-[#eee]">
                  Ваши данные
                </h2>
                <div className="flex flex-col gap-2 text-[14px] font-light leading-5 text-[#eee]">
                  <p>
                    {p.firstName} {p.lastName}
                  </p>
                  <p>{p.phone}</p>
                  {p.telegram ? <p>@{p.telegram.replace(/^@/, "")}</p> : null}
                  <p>{p.email}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-[16px] font-medium leading-5 text-[#eee]">
                    Обед
                  </p>
                  <p className="text-[14px] font-light leading-5 text-[#eee]">
                    {p.needsLunch === null
                      ? "—"
                      : p.needsLunch
                        ? "Нужен"
                        : "Не нужен"}
                  </p>
                </div>
                <Button type="button" onClick={() => setInfoOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
