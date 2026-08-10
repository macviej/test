"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import type { Participant } from "@/lib/types";
import { useAdminGuard } from "@/lib/use-admin-guard";

export default function AdminParticipantsPage() {
  const ready = useAdminGuard();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");
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
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-[18px] font-medium text-[#eee]">Участники</h1>
          <p className="text-[13px] text-[#9da1ab]">{filtered.length}</p>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск"
          className="w-full rounded-[20px] border border-[#eee] bg-transparent px-5 py-3 text-[14px] text-[#eee] outline-none placeholder:text-[#9da1ab]"
        />

        {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-[14px] text-[#9da1ab]">
            Пока нет участников
          </p>
        ) : (
          <div className="overflow-x-auto rounded-[16px] border border-[#2d2e32]">
            <table className="min-w-full border-collapse text-left text-[12px]">
              <thead className="bg-[#111] text-[#9da1ab]">
                <tr>
                  <th className="px-3 py-3 font-medium">Код</th>
                  <th className="px-3 py-3 font-medium">Имя</th>
                  <th className="px-3 py-3 font-medium">Телефон</th>
                  <th className="px-3 py-3 font-medium">Обед</th>
                  <th className="px-3 py-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-[#2d2e32]">
                    <td className="px-3 py-3 whitespace-nowrap text-[#eee]">
                      #{p.code}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-[#eee]">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-[#9da1ab]">
                      {p.phone}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-[#9da1ab]">
                      {p.needsLunch === null ? "—" : p.needsLunch ? "Да" : "Нет"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={
                          p.checkedIn ? "text-[#43c510]" : "text-[#9da1ab]"
                        }
                      >
                        {p.checkedIn ? "На месте" : "Ожидает"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
