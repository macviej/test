"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
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
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[18px] font-medium text-[#eee]">Q&A</h1>
          <button
            type="button"
            onClick={() => setUnansweredOnly((v) => !v)}
            className={`rounded-lg px-3 py-2 text-[12px] font-medium ${
              unansweredOnly ? "bg-[#eee] text-black" : "border border-[#eee] text-[#eee]"
            }`}
          >
            {unansweredOnly ? "неотвеченные" : "все"}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-[14px] text-[#9da1ab]">
              Вопросов пока нет
            </p>
          ) : (
            items.map((q) => (
              <div
                key={q.id}
                className="rounded-[20px] border border-[#eee]/50 bg-white/10 p-4"
              >
                <p className="text-[14px] font-medium leading-5 text-[#eee]">
                  {q.text}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[#9da1ab]">
                  <span>♥ {q.likeCount}</span>
                  <span>
                    {q.status === "answered" ? "отвечен" : "ожидает"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {q.status === "open" ? (
                    <button
                      type="button"
                      onClick={() => markAnswered(q.id)}
                      className="rounded-full border border-[#eee] px-3 py-1.5 text-[12px] text-[#eee]"
                    >
                      Отметить отвеченным
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => reopen(q.id)}
                      className="rounded-full border border-[#eee] px-3 py-1.5 text-[12px] text-[#eee]"
                    >
                      Вернуть в открытые
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(q.id)}
                    className="rounded-full border border-[#d15a32] px-3 py-1.5 text-[12px] text-[#d15a32]"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-4">
          <Button type="button" variant="ghost" onClick={load}>
            Обновить
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
