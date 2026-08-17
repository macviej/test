"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import type { Participant } from "@/lib/types";
import { useAdminGuard } from "@/lib/use-admin-guard";

type SortKey =
  | "code"
  | "name"
  | "phone"
  | "telegram"
  | "email"
  | "lunch"
  | "allergy"
  | "createdAt"
  | "checkedIn";

type CheckFilter = "all" | "in" | "out";
type LunchFilter = "all" | "standard" | "vegan" | "none";
type AllergyFilter = "all" | "yes" | "no";

function lunchBadge(p: Participant) {
  if (p.needsLunch === false || p.needsLunch === null) {
    return { label: "w/o", className: "bg-[#993cf0]" };
  }
  if (p.lunchType === "vegan") {
    return { label: "vegan", className: "bg-[#2f9e44]" };
  }
  return { label: "standart", className: "bg-[#d15a32]" };
}

function lunchRank(p: Participant) {
  if (p.needsLunch === false || p.needsLunch === null) return 2;
  if (p.lunchType === "vegan") return 1;
  return 0;
}

function lunchLabel(p: Participant) {
  if (p.needsLunch === false || p.needsLunch === null) return "не нужен";
  return p.lunchType === "vegan" ? "веган" : "стандарт";
}

function allergyLabel(p: Participant) {
  if (!p.needsLunch) return "—";
  if (p.hasAllergy) return p.allergyNote.trim() || "да";
  return "нет";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function compare(a: Participant, b: Participant, key: SortKey) {
  switch (key) {
    case "code":
      return a.code.localeCompare(b.code, "ru");
    case "name":
      return `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "ru",
      );
    case "phone":
      return a.phone.localeCompare(b.phone, "ru");
    case "telegram":
      return a.telegram.localeCompare(b.telegram, "ru");
    case "email":
      return a.email.localeCompare(b.email, "ru");
    case "lunch":
      return lunchRank(a) - lunchRank(b);
    case "allergy":
      return Number(Boolean(a.hasAllergy)) - Number(Boolean(b.hasAllergy));
    case "checkedIn":
      return Number(a.checkedIn) - Number(b.checkedIn);
    case "createdAt":
    default:
      return +new Date(a.createdAt) - +new Date(b.createdAt);
  }
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
    "allergy",
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
      allergyLabel(p),
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
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [checkFilter, setCheckFilter] = useState<CheckFilter>("all");
  const [lunchFilter, setLunchFilter] = useState<LunchFilter>("all");
  const [allergyFilter, setAllergyFilter] = useState<AllergyFilter>("all");
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
    const rows = participants.filter((p) => {
      if (checkFilter === "in" && !p.checkedIn) return false;
      if (checkFilter === "out" && p.checkedIn) return false;
      if (lunchFilter === "none" && p.needsLunch !== false && p.needsLunch !== null) {
        return false;
      }
      if (lunchFilter === "standard" && !(p.needsLunch && p.lunchType !== "vegan")) {
        return false;
      }
      if (lunchFilter === "vegan" && !(p.needsLunch && p.lunchType === "vegan")) {
        return false;
      }
      if (allergyFilter === "yes" && !p.hasAllergy) return false;
      if (allergyFilter === "no" && p.hasAllergy) return false;
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
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    rows.sort((a, b) => {
      const result = compare(a, b, sortKey);
      return sortDir === "asc" ? result : -result;
    });
    return rows;
  }, [
    participants,
    query,
    sortKey,
    sortDir,
    checkFilter,
    lunchFilter,
    allergyFilter,
  ]);

  const checkedInCount = participants.filter((p) => p.checkedIn).length;
  const veganCount = participants.filter(
    (p) => p.needsLunch && p.lunchType === "vegan",
  ).length;
  const allergyCount = participants.filter((p) => p.hasAllergy).length;

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "createdAt" || key === "checkedIn" ? "desc" : "asc");
  }

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
      <AppShell showBack backHref="/admin" wide>
        <p className="mt-20 text-center text-[14px] text-[#9da1ab]">Загрузка...</p>
      </AppShell>
    );
  }

  return (
    <AppShell showBack backHref="/admin" wide>
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-[18px] font-medium leading-6 text-[#eee]">
              Регистрация
            </h1>
            <p className="text-[13px] font-light text-[#9da1ab]">
              {checkedInCount}/{participants.length} на месте · {veganCount} vegan ·{" "}
              {allergyCount} аллергия · показано {filtered.length}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по имени, коду, телефону, email"
              className="w-full min-w-0 rounded-[20px] border border-[#eee] bg-transparent px-5 py-3 text-[14px] text-[#eee] outline-none placeholder:text-[#9da1ab] transition-colors duration-200 hover:border-white/80 focus:border-white sm:w-[320px] lg:w-[380px]"
            />
            <button
              type="button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="admin-chip h-[46px] shrink-0 rounded-[20px] border border-[#eee] px-4 text-[12px] font-semibold uppercase text-[#eee] hover:bg-white/15 hover:border-white disabled:opacity-50"
            >
              CSV
            </button>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3">
          <FilterRow
            label="Check-in"
            options={[
              { id: "all", label: "все" },
              { id: "in", label: "на месте" },
              { id: "out", label: "не отмечены" },
            ]}
            value={checkFilter}
            onChange={setCheckFilter}
          />
          <FilterRow
            label="Обед"
            options={[
              { id: "all", label: "все" },
              { id: "standard", label: "стандарт" },
              { id: "vegan", label: "веган" },
              { id: "none", label: "без обеда" },
            ]}
            value={lunchFilter}
            onChange={setLunchFilter}
          />
          <FilterRow
            label="Аллергия"
            options={[
              { id: "all", label: "все" },
              { id: "yes", label: "есть" },
              { id: "no", label: "нет" },
            ]}
            value={allergyFilter}
            onChange={setAllergyFilter}
          />
        </div>

        {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-[14px] text-[#9da1ab]">
            {participants.length === 0
              ? "Пока нет участников"
              : "Никого не найдено — сбросьте фильтр или поиск"}
          </p>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto rounded-[20px]">
            <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-[#eee]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-black/70 backdrop-blur-md">
                  <th className="w-12 px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9da1ab]">
                    In
                  </th>
                  <SortTh
                    label="Код"
                    active={sortKey === "code"}
                    dir={sortDir}
                    onClick={() => toggleSort("code")}
                  />
                  <SortTh
                    label="Имя"
                    active={sortKey === "name"}
                    dir={sortDir}
                    onClick={() => toggleSort("name")}
                  />
                  <SortTh
                    className="hidden md:table-cell"
                    label="Телефон"
                    active={sortKey === "phone"}
                    dir={sortDir}
                    onClick={() => toggleSort("phone")}
                  />
                  <SortTh
                    className="hidden lg:table-cell"
                    label="Telegram"
                    active={sortKey === "telegram"}
                    dir={sortDir}
                    onClick={() => toggleSort("telegram")}
                  />
                  <SortTh
                    className="hidden lg:table-cell"
                    label="Email"
                    active={sortKey === "email"}
                    dir={sortDir}
                    onClick={() => toggleSort("email")}
                  />
                  <SortTh
                    label="Обед"
                    active={sortKey === "lunch"}
                    dir={sortDir}
                    onClick={() => toggleSort("lunch")}
                  />
                  <SortTh
                    className="hidden md:table-cell"
                    label="Аллергия"
                    active={sortKey === "allergy"}
                    dir={sortDir}
                    onClick={() => toggleSort("allergy")}
                  />
                  <SortTh
                    className="hidden xl:table-cell"
                    label="Регистрация"
                    active={sortKey === "createdAt"}
                    dir={sortDir}
                    onClick={() => toggleSort("createdAt")}
                  />
                  <SortTh
                    label="Check-in"
                    active={sortKey === "checkedIn"}
                    dir={sortDir}
                    onClick={() => toggleSort("checkedIn")}
                  />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, index) => {
                  const badge = lunchBadge(p);
                  return (
                    <tr
                      key={p.id}
                      className={`admin-row ${
                        index % 2 === 0
                          ? "bg-white/40 hover:bg-white/55"
                          : "bg-white/20 hover:bg-white/40"
                      }`}
                    >
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => checkIn(p)}
                          disabled={p.checkedIn || pendingId === p.id}
                          className="flex size-6 items-center justify-center rounded-full border border-[#eee] transition-all duration-200 hover:scale-110 hover:border-white hover:bg-white/15 disabled:hover:scale-100"
                          aria-label={
                            p.checkedIn ? "Уже отмечен" : "Отметить участника"
                          }
                          aria-pressed={p.checkedIn}
                        >
                          {p.checkedIn ? (
                            <span className="block size-3 rounded-full bg-[#eee]" />
                          ) : null}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[12px] font-light">
                        #{p.code}
                      </td>
                      <td className="px-3 py-3 text-[14px] font-semibold leading-5">
                        <span className="block">
                          {p.firstName} {p.lastName}
                        </span>
                        <span className="mt-1 block text-[12px] font-light text-[#eee]/80 md:hidden">
                          {p.phone}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-3 text-[13px] font-light md:table-cell">
                        {p.phone}
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-3 text-[13px] font-light lg:table-cell">
                        {p.telegram ? `@${p.telegram.replace(/^@/, "")}` : "—"}
                      </td>
                      <td className="hidden max-w-[220px] truncate px-3 py-3 text-[13px] font-light lg:table-cell">
                        {p.email}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex min-w-[73px] items-center justify-center rounded-full px-2 py-0.5 text-[10px] leading-[14px] text-[#eee] ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="hidden max-w-[180px] truncate px-3 py-3 text-[13px] font-light md:table-cell">
                        {allergyLabel(p)}
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-3 text-[12px] font-light text-[#eee]/80 xl:table-cell">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[13px] font-medium">
                        {p.checkedIn ? formatDate(p.checkedInAt) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-[72px] text-[11px] font-medium uppercase tracking-wide text-[#9da1ab]">
        {label}
      </span>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`admin-chip h-8 rounded-lg px-3 text-[12px] font-semibold ${
            value === option.id
              ? "bg-[#eee] text-black hover:bg-white"
              : "border border-[#eee] text-[#eee] hover:bg-white/15 hover:border-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SortTh({
  label,
  active,
  dir,
  onClick,
  className = "",
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={`px-3 py-3 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#9da1ab] transition-colors hover:text-[#eee]"
      >
        {label}
        <span className={active ? "text-[#eee]" : "opacity-30"}>
          {active && dir === "asc" ? "↑" : "↓"}
        </span>
      </button>
    </th>
  );
}
