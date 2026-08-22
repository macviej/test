"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { registerCopy } from "@/lib/i18n";
import { formatFullByPhone } from "@/lib/phone";
import type { Participant } from "@/lib/types";
import { useAdminGuard } from "@/lib/use-admin-guard";

type CheckFilter = "all" | "in" | "out";

function lunchBadge(p: Participant) {
  if (p.needsLunch === false || p.needsLunch === null) {
    return { label: "w/o", className: "bg-[#993cf0]" };
  }
  if (p.lunchType === "vegan") {
    return { label: "veg", className: "bg-[#2f9e44]" };
  }
  return { label: "std", className: "bg-[#d15a32]" };
}

function lunchLabel(p: Participant) {
  if (p.needsLunch === false || p.needsLunch === null) return "не нужен";
  return p.lunchType === "vegan" ? "вегетарианский" : "стандарт";
}

function dueAmount(p: Participant) {
  return p.needsLunch ? "30 BYN" : "15 BYN";
}

function allergyLabel(p: Participant) {
  if (!p.needsLunch) return "—";
  if (p.hasAllergy) return p.allergyNote.trim() || "да";
  return "нет";
}

function howHeardLabel(value: string) {
  const options = registerCopy.RU.extraHowHeardOptions;
  if (value in options) {
    return options[value as keyof typeof options];
  }
  return value;
}

function toCsv(rows: Participant[]) {
  const header = [
    "code",
    "firstName",
    "lastName",
    "phone",
    "telegram",
    "email",
    "lunch",
    "due",
    "allergy",
    "city",
    "church",
    "howHeard",
    "extraInfo",
    "checkedIn",
    "checkedInAt",
    "createdAt",
  ];
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const lines = rows.map((p) =>
    [
      p.code,
      p.firstName,
      p.lastName,
      p.phone,
      p.telegram,
      p.email,
      lunchLabel(p),
      dueAmount(p),
      allergyLabel(p),
      p.city,
      p.church,
      howHeardLabel(p.howHeard),
      p.extraInfo,
      p.checkedIn ? "yes" : "no",
      p.checkedInAt || "",
      p.createdAt,
    ]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export default function AdminParticipantsPage() {
  const ready = useAdminGuard();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");
  const [checkFilter, setCheckFilter] = useState<CheckFilter>("all");
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
    return participants.filter((p) => {
      if (checkFilter === "in" && !p.checkedIn) return false;
      if (checkFilter === "out" && p.checkedIn) return false;
      if (!q) return true;
      return [
        p.code,
        p.firstName,
        p.lastName,
        p.email,
        p.phone,
        p.telegram,
        p.lunchType,
        p.allergyNote,
        p.city,
        p.church,
        p.howHeard,
        p.extraInfo,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [participants, query, checkFilter]);

  const checkedInCount = participants.filter((p) => p.checkedIn).length;

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `imago-participants-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

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
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex shrink-0 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-[18px] font-medium leading-6 text-[#eee]">
              Регистрация
            </h1>
            <p className="text-[12px] font-light text-[#9da1ab]">
              {checkedInCount}/{participants.length} на месте
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="admin-text-action shrink-0 pt-1 text-[14px] font-medium text-[#eee] hover:text-white disabled:opacity-40"
          >
            CSV
          </button>
        </div>

        <label className="flex h-[46px] shrink-0 items-center gap-3 rounded-[20px] border border-[#eee] px-4 transition-colors duration-200 hover:border-white/80 focus-within:border-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/search.svg" alt="" className="size-5 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[#eee] outline-none placeholder:text-[#9da1ab]"
          />
        </label>

        <div className="flex shrink-0 flex-nowrap items-center gap-1.5 overflow-x-auto text-[11px] font-semibold">
          <span className="shrink-0 text-[#9da1ab]">Check-in</span>
          {(
            [
              { id: "all", label: "все" },
              { id: "in", label: "на месте" },
              { id: "out", label: "не отмечены" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setCheckFilter(option.id)}
              className={`admin-chip h-7 shrink-0 rounded-md px-2 ${
                checkFilter === option.id
                  ? "bg-[#eee] text-black hover:bg-white"
                  : "border border-[#eee] text-[#eee] hover:bg-white/15 hover:border-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-[14px] text-[#9da1ab]">
            {participants.length === 0
              ? "Пока нет участников"
              : "Никого не найдено — сбросьте фильтр или поиск"}
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
                        <p className="truncate text-[18px] font-semibold leading-6">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-[12px] font-light leading-4">
                          {dueAmount(p)}
                        </p>
                      </div>
                      <span
                        className={`mt-1 inline-flex min-w-[73px] shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[10px] leading-[14px] text-[#eee] ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </button>
                  </div>
                  {isOpen ? (
                    <div className="flex flex-col gap-1 px-4 pb-4 pl-[52px] text-[13px] font-light leading-5 text-[#eee]">
                      <p>#{p.code}</p>
                      <p>{formatFullByPhone(p.phone)}</p>
                      {p.telegram ? (
                        <p>@{p.telegram.replace(/^@/, "")}</p>
                      ) : null}
                      <p>{p.email}</p>
                      <p>
                        Обед: {lunchLabel(p)}
                        {p.needsLunch
                          ? p.hasAllergy
                            ? ` · аллергия: ${p.allergyNote || "да"}`
                            : " · аллергии нет"
                          : ""}
                      </p>
                      {p.city || p.church || p.howHeard ? (
                        <p>
                          {[p.city, p.church, howHeardLabel(p.howHeard)]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      ) : null}
                      {p.extraInfo ? <p>{p.extraInfo}</p> : null}
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
