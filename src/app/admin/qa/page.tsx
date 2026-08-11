"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAdminGuard } from "@/lib/use-admin-guard";

type QaItem = {
  id: string;
  text: string;
  likeCount: number;
  status: "open" | "answered" | "hidden";
  createdAt: string;
};

export default function AdminQaPage() {
  const ready = useAdminGuard();
  const [items, setItems] = useState<QaItem[]>([]);
  const [unansweredOnly, setUnansweredOnly] = useState(false);

  const load = useCallback(async () => {
    const qs = unansweredOnly ? "?unanswered=1" : "";
    const res = await fetch(`/api/qa${qs}`);
    const data = await res.json();
    if (res.ok) setItems(data.questions || []);
  }, [unansweredOnly]);

  useEffect(() => {
    if (!ready) return;
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [ready, load]);

  async function markAnswered(id: string) {
    await fetch(`/api/qa/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "answered" }),
    });
    await load();
  }

  async function reopen(id: string) {
    await fetch(`/api/qa/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "open" }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/qa/${id}`, { method: "DELETE" });
    await load();
  }

  if (!ready) {
    return (
      <AppShell showBack backHref="/admin">
        <p className="mt-20 text-center text-[14px] text-[#9da1ab]">Загрузка...</p>
      </AppShell>
    );
  }

  return (
    <AppShell showBack backHref="/admin">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setUnansweredOnly((v) => !v)}
            className="flex h-8 items-center justify-center rounded-lg bg-[#eee] px-1.5"
            aria-label="Фильтр"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/sort.svg" alt="" className="h-2.5 w-[15px]" />
          </button>
          <button
            type="button"
            onClick={() => setUnansweredOnly((v) => !v)}
            className="flex h-8 items-center rounded-lg bg-[#eee] px-3 text-[12px] font-medium text-black"
          >
            {unansweredOnly ? "неотвеченные" : "все"}
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-[14px] text-[#9da1ab]">
              Вопросов пока нет
            </p>
          ) : (
            items.map((q) => (
              <div
                key={q.id}
                className="flex flex-col gap-2.5 rounded-[20px] bg-white/40 p-5"
              >
                <p className="text-[14px] font-medium leading-5 text-[#eee]">
                  {q.text}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/like.svg" alt="" className="size-4" />
                    <span className="text-[12px] font-light text-[#eee]">
                      {q.likeCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {q.status === "answered" ? (
                      <button
                        type="button"
                        onClick={() => reopen(q.id)}
                        className="text-[11px] text-[#43c510]"
                      >
                        отвечен
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markAnswered(q.id)}
                        className="text-[11px] text-[#eee] underline"
                      >
                        отметить
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(q.id)}
                      className="text-[11px] text-[#9da1ab] underline"
                    >
                      удалить
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
