"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useReorderAnimation } from "@/hooks/useReorderAnimation";
import { deviceHeaders } from "@/lib/device-id";
import { useAdminGuard } from "@/lib/use-admin-guard";

type QaItem = {
  id: string;
  text: string;
  likeCount: number;
  status: "open" | "answered" | "hidden";
  createdAt: string;
};

type ProjectorState = {
  mode: "idle" | "list" | "focus";
  questionId: string | null;
};

export default function AdminQaPage() {
  const ready = useAdminGuard();
  const [items, setItems] = useState<QaItem[]>([]);
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  const [projector, setProjector] = useState<ProjectorState>({
    mode: "list",
    questionId: null,
  });
  const [knownIds, setKnownIds] = useState<Set<string>>(() => new Set());

  const load = useCallback(async () => {
    const qs = unansweredOnly ? "?unanswered=1" : "";
    const [qaRes, projRes] = await Promise.all([
      fetch(`/api/qa${qs}`, { headers: deviceHeaders() }),
      fetch("/api/admin/projector"),
    ]);
    const qaData = await qaRes.json();
    if (qaRes.ok) {
      const next = (qaData.questions || []) as QaItem[];
      setItems(next);
      setKnownIds((prev) =>
        prev.size === 0 ? new Set(next.map((q) => q.id)) : prev,
      );
    }
    if (projRes.ok) {
      const projData = await projRes.json();
      setProjector({
        mode: projData.mode || "list",
        questionId: projData.questionId || null,
      });
    }
  }, [unansweredOnly]);

  useEffect(() => {
    if (!ready) return;
    const start = window.setTimeout(() => {
      void load();
    }, 0);
    const timer = window.setInterval(() => {
      void load();
    }, 3000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [ready, load]);

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

  const listRef = useReorderAnimation(items.map((q) => q.id));

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
    setItems((prev) => prev.filter((q) => q.id !== id));
    await fetch(`/api/qa/${id}`, {
      method: "DELETE",
      headers: deviceHeaders(),
    });
    await load();
  }

  async function setScreen(mode: ProjectorState["mode"], questionId?: string) {
    setProjector({ mode, questionId: questionId ?? null });
    await fetch("/api/admin/projector", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        questionId: questionId ?? null,
      }),
    });
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
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <a
            href="/qa/screen"
            target="_blank"
            rel="noreferrer"
            className="admin-text-action text-[12px] font-semibold uppercase text-[#eee] underline decoration-transparent underline-offset-4 hover:decoration-[#eee] hover:text-white"
          >
            Открыть проектор
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUnansweredOnly((v) => !v)}
              className="admin-chip flex h-8 items-center justify-center rounded-lg bg-[#eee] px-1.5 hover:bg-white hover:shadow-[0_6px_16px_rgba(238,238,238,0.2)]"
              aria-label="Фильтр"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/sort.svg" alt="" className="h-2.5 w-[15px]" />
            </button>
            <button
              type="button"
              onClick={() => setUnansweredOnly((v) => !v)}
              className="admin-chip flex h-8 items-center rounded-lg bg-[#eee] px-3 text-[12px] font-medium text-black hover:bg-white hover:shadow-[0_6px_16px_rgba(238,238,238,0.2)]"
            >
              {unansweredOnly ? "неотвеченные" : "все"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ModeChip
            active={projector.mode === "idle"}
            onClick={() => setScreen("idle")}
          >
            Ожидание
          </ModeChip>
          <ModeChip
            active={projector.mode === "list"}
            onClick={() => setScreen("list")}
          >
            Лента
          </ModeChip>
        </div>

        <div
          ref={listRef}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4"
        >
          {items.length === 0 ? (
            <p className="mt-10 text-center text-[14px] text-[#9da1ab]">
              Вопросов пока нет
            </p>
          ) : (
            items.map((q) => {
              const onScreen =
                projector.mode === "focus" && projector.questionId === q.id;
              const entering = knownIds.size > 0 && !knownIds.has(q.id);
              return (
                <div
                  key={q.id}
                  data-flip-id={q.id}
                  className={`qa-card flex flex-col gap-2.5 rounded-[20px] p-5 ${
                    onScreen
                      ? "bg-white/55 shadow-[0_0_0_1px_#43c510,0_12px_32px_rgba(67,197,16,0.18)]"
                      : "bg-white/40 hover:bg-white/55"
                  } ${entering ? "qa-card-enter" : ""}`}
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
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      {q.status === "open" ? (
                        <button
                          type="button"
                          onClick={() =>
                            onScreen
                              ? setScreen("list")
                              : setScreen("focus", q.id)
                          }
                          className={`admin-text-action text-[11px] underline ${
                            onScreen
                              ? "text-[#43c510] hover:text-[#6ee03a]"
                              : "text-[#eee] hover:text-white"
                          }`}
                        >
                          {onScreen ? "на экране" : "на проектор"}
                        </button>
                      ) : null}
                      {q.status === "answered" ? (
                        <button
                          type="button"
                          onClick={() => reopen(q.id)}
                          className="admin-text-action text-[11px] text-[#43c510] hover:text-[#6ee03a]"
                        >
                          отвечен
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markAnswered(q.id)}
                          className="admin-text-action text-[11px] text-[#eee] underline hover:text-white"
                        >
                          отметить
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(q.id)}
                        className="admin-text-action text-[11px] text-[#9da1ab] underline hover:text-[#d15a32]"
                      >
                        удалить
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}

function ModeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`admin-chip h-8 rounded-lg px-3 text-[12px] font-semibold ${
        active
          ? "bg-[#eee] text-black hover:bg-white hover:shadow-[0_6px_16px_rgba(238,238,238,0.22)]"
          : "border border-[#eee] text-[#eee] hover:bg-white/15 hover:border-white"
      }`}
    >
      {children}
    </button>
  );
}
