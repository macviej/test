"use client";

import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useReorderAnimation } from "@/hooks/useReorderAnimation";

type ScreenQuestion = {
  id: string;
  text: string;
  likeCount: number;
};

type ScreenPayload = {
  mode: "idle" | "list" | "focus";
  featured: ScreenQuestion | null;
  questions: ScreenQuestion[];
  qrDataUrl: string;
};

function QrBlock({ dataUrl }: { dataUrl?: string }) {
  return (
    <div className="flex flex-col items-center gap-6">
      {dataUrl ? (
        <div className="rounded-[16px] bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="QR для вопросов" className="size-[216px]" />
        </div>
      ) : (
        <div className="size-[240px] rounded-[16px] bg-white/20" />
      )}
      <p className="w-[290px] text-center text-[28px] font-medium leading-10 text-[#eee]">
        Задать вопрос можно здесь
      </p>
    </div>
  );
}

export default function ProjectorScreenPage() {
  const [data, setData] = useState<ScreenPayload | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/qa/screen");
    const json = await res.json();
    if (res.ok) setData(json);
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => {
      void load();
    }, 0);
    const timer = window.setInterval(() => {
      void load();
    }, 2000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [load]);

  const mode = data?.mode ?? "idle";
  const featured = data?.featured;
  const listIds = data?.questions.slice(0, 6).map((q) => q.id) ?? [];
  const listRef = useReorderAnimation(listIds);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black text-[#eee]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-black" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/stars-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-bottom opacity-60 mix-blend-hard-light"
        />
        <div
          className="absolute inset-0"
          style={{
            boxShadow:
              "inset 0px 24px 24px -8px rgba(35,101,255,0.15), inset 0px -83px 83px -25px rgba(255,255,255,0.4), inset 0px -166px 124px -33px rgba(102,148,255,0.5), inset 0px -331px 249px -124px #144ccd",
          }}
        />
      </div>

      {mode === "focus" && featured ? (
        <div
          key={featured.id}
          className="relative z-10 flex h-full w-full flex-col"
        >
          <div className="pointer-events-none absolute left-1/2 top-8 z-20 -translate-x-1/2 qa-screen-fade">
            <Logo href={null} size="sm" />
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-8 pb-36 pt-24 md:px-16 lg:px-24">
            <p className="qa-focus-enter w-full max-w-[1600px] text-center text-[clamp(40px,7vw,96px)] font-medium leading-[1.1] text-[#eee]">
              {featured.text}
            </p>
          </div>

          <div className="absolute left-8 top-8 flex items-center gap-2 qa-screen-fade">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/like.svg" alt="" className="size-7" />
            <span className="text-[22px] leading-8 text-[#eee]">
              {featured.likeCount}
            </span>
          </div>

          <div className="absolute bottom-8 right-8 qa-focus-enter [animation-delay:120ms]">
            <div className="flex items-end gap-4">
              <p className="max-w-[160px] pb-1 text-right text-[16px] font-medium leading-6 text-[#eee]">
                Задать вопрос можно здесь
              </p>
              {data?.qrDataUrl ? (
                <div className="rounded-[12px] bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.qrDataUrl}
                    alt="QR для вопросов"
                    className="size-[132px]"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div
          key={mode}
          className="relative z-10 flex h-full w-full qa-screen-fade"
        >
          <div className="relative min-w-0 flex-1 px-[100px] pb-16 pt-[60px]">
            <div className="pointer-events-none absolute left-1/2 top-[60px] z-20 -translate-x-1/2">
              <Logo href={null} size="lg" />
            </div>

            {mode === "idle" || !data ? (
              <div className="flex h-full items-center">
                <p className="qa-focus-enter max-w-[820px] text-[clamp(28px,3.2vw,44px)] font-light leading-[1.25] text-[#eee]">
                  Задавайте вопросы — они появятся на экране
                </p>
              </div>
            ) : null}

            {mode === "list" && data ? (
              <div className="flex h-full max-w-[820px] flex-col pt-[140px]">
                <div className="mb-8 flex h-8 w-[160px] items-center rounded-lg bg-[#eee] px-3 text-[12px] font-medium text-black">
                  популярный
                </div>
                <div
                  ref={listRef}
                  className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden"
                >
                  {data.questions.length === 0 ? (
                    <p className="text-[20px] font-light leading-7 text-[#9da1ab]">
                      Пока нет вопросов
                    </p>
                  ) : (
                    data.questions.slice(0, 6).map((q) => (
                      <article
                        key={q.id}
                        data-flip-id={q.id}
                        className="qa-card flex flex-col gap-5 rounded-tl-[20px] rounded-tr-[20px] rounded-br-[20px] bg-white/40 p-5"
                      >
                        <p className="text-[20px] font-light leading-7 text-[#eee]">
                          {q.text}
                        </p>
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/assets/like.svg" alt="" className="size-5" />
                          <span className="text-[14px] leading-5 text-[#eee]">
                            {q.likeCount}
                          </span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="flex w-[min(500px,34vw)] shrink-0 items-center justify-center">
            <div className="flex w-[240px] flex-col items-center">
              <QrBlock dataUrl={data?.qrDataUrl} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
