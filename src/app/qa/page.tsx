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
  const [likeBurst, setLikeBurst] = useState<string | null>(null);
  const [knownIds, setKnownIds] = useState<Set<string>>(() => new Set());

  const load = useCallback(async () => {
    const res = await fetch("/api/qa");
    const data = await res.json();
    if (!res.ok) return;
    const next = (data.questions || []) as QaItem[];
    setItems(next);
    setKnownIds((prev) =>
      prev.size === 0 ? new Set(next.map((q) => q.id)) : prev,
    );
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => {
      void load();
    }, 0);
    const timer = window.setInterval(() => {
      void load();
    }, 4000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKnownIds((prev) => {
        let changed = false;
        const merged = new Set(prev);
        for (const item of items) {
          if (!merged.has(item.id)) {
            merged.add(item.id);
            changed = true;
          }
        }
        return changed ? merged : prev;
      });
    }, 480);
    return () => window.clearTimeout(timer);
  }, [items]);

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
    setLikeBurst(id);
    setItems((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              likedByMe: !q.likedByMe,
              likeCount: q.likedByMe ? Math.max(0, q.likeCount - 1) : q.likeCount + 1,
            }
          : q,
      ),
    );
    const res = await fetch(`/api/qa/${id}/like`, { method: "POST" });
    if (res.ok) await load();
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((q) => q.id !== id));
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
          className="admin-icon-btn size-[30px]"
        >
          <img src="/assets/info.svg" alt="" className="size-[30px]" />
        </button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {infoOpen ? (
          <p className="animate-dialog-in rounded-[16px] border border-[#eee]/40 px-4 py-3 text-[13px] leading-5 text-[#eee]">
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
            className="admin-chip flex h-8 items-center justify-center rounded-lg bg-[#eee] px-1.5 hover:bg-white hover:shadow-[0_6px_16px_rgba(238,238,238,0.2)]"
            aria-label="Сменить сортировку"
          >
            <img src="/assets/sort.svg" alt="" className="h-2.5 w-[15px]" />
          </button>
          <button
            type="button"
            onClick={() =>
              setSort((s) => (s === "popular" ? "recent" : "popular"))
            }
            className="admin-chip flex h-8 items-center rounded-lg bg-[#eee] px-3 text-[12px] font-medium text-black hover:bg-white hover:shadow-[0_6px_16px_rgba(238,238,238,0.2)]"
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
            visible.map((q) => {
              const entering = knownIds.size > 0 && !knownIds.has(q.id);
              return (
                <div
                  key={q.id}
                  className={`qa-card flex flex-col gap-2.5 rounded-[20px] bg-white/40 p-5 hover:bg-white/55 hover:-translate-y-0.5 ${
                    entering ? "qa-card-enter" : ""
                  }`}
                >
                  <p className="text-[14px] font-medium leading-5 text-[#eee]">
                    {q.text}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => like(q.id)}
                      className="flex items-center gap-1 transition-opacity duration-200 hover:opacity-100"
                    >
                      <img
                        src="/assets/like.svg"
                        alt=""
                        className={`size-4 transition-opacity duration-200 ${
                          q.likedByMe ? "opacity-100" : "opacity-70"
                        } ${likeBurst === q.id ? "like-pop" : ""}`}
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
                          className="admin-text-action text-[11px] text-[#9da1ab] underline hover:text-[#d15a32]"
                        >
                          удалить
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

        <form
          onSubmit={submit}
          className="mt-auto flex h-[52px] items-center gap-2 rounded-full bg-[#eee] py-2 pl-4 pr-2 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-shadow duration-300 focus-within:shadow-[0_0_18px_rgba(238,238,238,0.35)]"
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
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black transition-transform duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
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
