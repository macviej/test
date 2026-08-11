"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import type { Participant } from "@/lib/types";
import { useAdminGuard } from "@/lib/use-admin-guard";

function lunchBadge(needsLunch: boolean | null) {
  if (needsLunch === true) {
    return { label: "standart", className: "bg-[#d15a32]" };
  }
  if (needsLunch === false) {
    return { label: "w/o", className: "bg-[#993cf0]" };
  }
  return { label: "—", className: "bg-[#9da1ab]" };
}

export default function AdminParticipantsPage() {
  const ready = useAdminGuard();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/admin/participants");
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error || "Не удалось загрузить");
        return;
      }
      setParticipants(data.participants || []);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) =>
      [p.code, p.firstName, p.lastName, p.email, p.phone, p.telegram]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [participants, query]);

  function toggleSelected(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
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
      <div className="flex min-h-0 flex-1 flex-col gap-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[18px] font-medium leading-6 text-[#eee]">
            Регистрация
          </h1>
          <button
            type="button"
            aria-label="Поиск"
            onClick={() => setSearchOpen((v) => !v)}
            className="size-6 shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/search.svg" alt="" className="size-6" />
          </button>
        </div>

        {searchOpen ? (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск"
            autoFocus
            className="w-full rounded-[20px] border border-[#eee] bg-transparent px-5 py-3 text-[14px] text-[#eee] outline-none placeholder:text-[#9da1ab]"
          />
        ) : null}

        {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-[14px] text-[#9da1ab]">
            Пока нет участников
          </p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-t-[20px]">
            {filtered.map((p, index) => {
              const badge = lunchBadge(p.needsLunch);
              const isSelected = Boolean(selected[p.id] || p.checkedIn);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleSelected(p.id)}
                  className={`flex w-full flex-col items-start p-4 text-left ${
                    index % 2 === 0
                      ? "bg-white/40"
                      : "bg-white/20"
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-4">
                      <span
                        className={`size-6 shrink-0 rounded-lg border border-[#eee] ${
                          isSelected ? "bg-[#eee]" : "bg-transparent"
                        }`}
                        aria-hidden
                      />
                      <div className="flex min-w-0 flex-col gap-1 text-[#eee]">
                        <p className="text-[12px] font-light leading-4">
                          #{p.code}
                        </p>
                        <p className="truncate text-[20px] font-semibold leading-7">
                          <span>{p.firstName}</span>{" "}
                          <span>{p.lastName}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2.5">
                      <p className="text-[16px] font-medium leading-5 text-[#eee]">
                        {p.checkedIn ? "✓" : "—"}
                      </p>
                      <span
                        className={`inline-flex min-w-[73px] items-center justify-center rounded-full px-2 py-0.5 text-[10px] leading-[14px] text-[#eee] ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
