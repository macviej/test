"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import type { Participant } from "@/lib/types";
import { useAdminGuard } from "@/lib/use-admin-guard";

function lunchBadge(p: Participant) {
  if (p.needsLunch === false || p.needsLunch === null) {
    return { label: "w/o", className: "bg-[#993cf0]" };
  }
  if (p.lunchType === "vegan") {
    return { label: "vegan", className: "bg-[#2f9e44]" };
  }
  return { label: "standart", className: "bg-[#d15a32]" };
}

export default function AdminParticipantsPage() {
  const ready = useAdminGuard();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
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
      [
        p.code,
        p.firstName,
        p.lastName,
        p.email,
        p.phone,
        p.telegram,
        p.lunchType,
        p.allergyNote,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [participants, query]);

  async function checkIn(p: Participant) {
    if (p.checkedIn || pendingId) return;
    setPendingId(p.id);
    setError("");
    try {
      const res = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: p.code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось отметить");
        return;
      }
      const updated = data.participant as Participant;
      setParticipants((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch {
      setError("Не удалось отметить участника");
    } finally {
      setPendingId(null);
    }
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
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <div className="flex shrink-0 flex-col gap-4">
          <h1 className="text-[18px] font-medium leading-6 text-[#eee]">
            Регистрация
          </h1>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск"
            className="w-full rounded-[20px] border border-[#eee] bg-transparent px-5 py-3 text-[14px] text-[#eee] outline-none placeholder:text-[#9da1ab]"
          />
        </div>

        {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-[14px] text-[#9da1ab]">
            Пока нет участников
          </p>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto rounded-t-[20px]">
            {filtered.map((p, index) => {
              const badge = lunchBadge(p);
              const isOpen = Boolean(expanded[p.id]);
              return (
                <div
                  key={p.id}
                  className={`w-full ${
                    index % 2 === 0 ? "bg-white/40" : "bg-white/20"
                  }`}
                >
                  <div className="flex w-full items-start gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => checkIn(p)}
                      disabled={p.checkedIn || pendingId === p.id}
                      className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-[#eee]"
                      aria-label={
                        p.checkedIn ? "Уже отмечен" : "Отметить участника"
                      }
                      aria-pressed={p.checkedIn}
                    >
                      {p.checkedIn ? (
                        <span className="block size-3 rounded-full bg-[#eee]" />
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [p.id]: !prev[p.id],
                        }))
                      }
                      className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
                    >
                      <div className="flex min-w-0 flex-col gap-1 text-[#eee]">
                        <p className="text-[12px] font-light leading-4">
                          #{p.code}
                        </p>
                        <p className="truncate text-[20px] font-semibold leading-7">
                          <span>{p.firstName}</span>{" "}
                          <span>{p.lastName}</span>
                        </p>
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
                    </button>
                  </div>
                  {isOpen ? (
                    <div className="flex flex-col gap-1 px-4 pb-4 pl-[52px] text-[13px] font-light leading-5 text-[#eee]">
                      <p>{p.phone}</p>
                      {p.telegram ? <p>@{p.telegram.replace(/^@/, "")}</p> : null}
                      <p>{p.email}</p>
                      {p.needsLunch ? (
                        <p>
                          Обед:{" "}
                          {p.lunchType === "vegan" ? "веган" : "стандарт"}
                          {p.hasAllergy
                            ? ` · аллергия: ${p.allergyNote || "да"}`
                            : " · аллергии нет"}
                        </p>
                      ) : (
                        <p>Обед: не нужен</p>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
