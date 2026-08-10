"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";

type QaItem = {
  id: string;
  text: string;
  likeCount: number;
  likedByMe: boolean;
  isMine: boolean;
  status: "open" | "answered" | "hidden";
  createdAt: string;
};

type SortMode = "popular" | "recent";

export default function QaPage() {
  const [items, setItems] = useState<QaItem[]>([]);
  const [text, setText] = useState("");
  const [sort, setSort] = useState<SortMode>("popular");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/qa");
    const data = await res.json();
    if (res.ok) setItems(data.questions || []);
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 4000);
    return () => clearInterval(timer);
  }, [load]);

  const visible = useMemo(() => {
    const list = [...items].filter((q) => q.status !== "hidden");
    if (sort === "popular") {
      list.sort((a, b) => b.likeCount - a.likeCount || +new Date(b.createdAt) - +new Date(a.createdAt));
    } else {
      list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return list;
  }, [items, sort]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError("");
    try {
      const ticket = localStorage.getItem("imago-ticket");
      let authorLabel = "Участник";
      if (ticket) {
        try {
          const parsed = JSON.parse(ticket) as { firstName?: string };
          if (parsed.firstName) authorLabel = parsed.firstName;
        } catch {
          // ignore
        }
      }

      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, authorLabel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка");
        return;
      }
      setText("");
      await load();
    } catch {
      setError("Не удалось отправить");
    } finally {
      setSending(false);
    }
  }

  async function like(id: string) {
    const res = await fetch(`/api/qa/${id}/like`, { method: "POST" });
    if (res.ok) await load();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/qa/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  return (
    <AppShell
      showBack
      backHref="/"
      headerRight={
        <button
          type="button"
          aria-label="Информация"
          onClick={() => setInfoOpen((v) => !v)}
          className="size-[30px]"
        >
          <img src="/assets/info.svg" alt="" className="size-[30px]" />
        </button>
      }
    >
      <div className="flex flex-1 flex-col gap-4">
        {infoOpen ? (
          <p className="rounded-[16px] border border-[#eee]/40 px-4 py-3 text-[13px] leading-5 text-[#eee]">
            Задавайте вопросы спикерам. Популярные поднимаются выше по лайкам.
            Свой вопрос можно удалить.
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() =>
              setSort((s) => (s === "popular" ? "recent" : "popular"))
            }
            className="flex h-8 items-center justify-center rounded-lg bg-[#eee] px-1.5"
            aria-label="Сменить сортировку"
          >
            <img src="/assets/sort.svg" alt="" className="h-2.5 w-[15px]" />
          </button>
          <button
            type="button"
            onClick={() =>
              setSort((s) => (s === "popular" ? "recent" : "popular"))
            }
            className="flex h-8 items-center rounded-lg bg-[#eee] px-3 text-[12px] font-medium text-black"
          >
            {sort === "popular" ? "популярный" : "недавний"}
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
          {visible.length === 0 ? (
            <p className="mt-10 text-center text-[14px] text-[#9da1ab]">
              Пока нет вопросов — задайте первый
            </p>
          ) : (
            visible.map((q) => (
              <div
                key={q.id}
                className="flex flex-col gap-2.5 rounded-[20px] bg-white/40 p-5"
              >
                <p className="text-[14px] font-medium leading-5 text-[#eee]">
                  {q.text}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => like(q.id)}
                    className="flex items-center gap-1"
                  >
                    <img
                      src="/assets/like.svg"
                      alt=""
                      className={`size-4 ${q.likedByMe ? "opacity-100" : "opacity-70"}`}
                    />
                    <span className="text-[12px] font-light text-[#eee]">
                      {q.likeCount}
                    </span>
                  </button>
                  <div className="flex items-center gap-3">
                    {q.status === "answered" ? (
                      <span className="text-[11px] text-[#43c510]">отвечен</span>
                    ) : null}
                    {q.isMine ? (
                      <button
                        type="button"
                        onClick={() => remove(q.id)}
                        className="text-[11px] text-[#9da1ab] underline"
                      >
                        удалить
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

        <form
          onSubmit={submit}
          className="mt-auto flex h-[52px] items-center gap-2 rounded-full bg-[#eee] py-2 pl-4 pr-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Задать вопрос"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-light text-black outline-none placeholder:text-[#9da1ab]"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black disabled:opacity-50"
            aria-label="Отправить"
          >
            <img
              src="/assets/arrow-up-right.svg"
              alt=""
              className="size-6 invert"
            />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
