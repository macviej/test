"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import type { Participant } from "@/lib/types";
import { useAdminGuard } from "@/lib/use-admin-guard";

type CheckInResult = {
  participant: Participant;
  alreadyCheckedIn: boolean;
};

export default function AdminScannerPage() {
  const ready = useAdminGuard();
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .catch(() => undefined)
          .finally(() => scanner.clear());
      }
    };
  }, []);

  async function checkIn(code: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка");
        return;
      }
      setResult(data);
      setManualCode("");
    } catch {
      setError("Не удалось отметить участника");
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }

  async function startScanner() {
    setError("");
    setScanning(true);
    await new Promise((resolve) => setTimeout(resolve, 50));
    try {
      const scanner = new Html5Qrcode("admin-qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          void checkIn(decoded);
        },
        () => undefined,
      );
    } catch {
      setScanning(false);
      scannerRef.current = null;
      setError("Камера недоступна — введите код вручную");
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (!scanner) {
      setScanning(false);
      return;
    }
    try {
      await scanner.stop();
      scanner.clear();
    } catch {
      // ignore
    }
    scannerRef.current = null;
    setScanning(false);
  }

  async function onManualSubmit(event: FormEvent) {
    event.preventDefault();
    await checkIn(manualCode);
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
      <div className="flex flex-1 flex-col gap-6">
        <h1 className="text-[18px] font-medium text-[#eee]">Сканер QR</h1>

        <div className="overflow-hidden rounded-[20px] border border-[#eee] bg-black/40">
          <div
            id="admin-qr-reader"
            className={scanning ? "w-full" : "hidden"}
          />
          {!scanning ? (
            <div className="flex min-h-[260px] items-center justify-center px-6 text-center text-[14px] text-[#9da1ab]">
              Нажмите «Включить камеру»
            </div>
          ) : null}
        </div>

        <div className="flex gap-3">
          {!scanning ? (
            <Button type="button" onClick={startScanner}>
              Включить камеру
            </Button>
          ) : (
            <Button type="button" variant="choice" onClick={stopScanner}>
              Стоп
            </Button>
          )}
        </div>

        <form onSubmit={onManualSubmit} className="flex flex-col gap-4">
          <Field
            label="Или введите код"
            placeholder="IGC-2026-001"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <Button type="submit" disabled={loading || !manualCode.trim()}>
            {loading ? "Проверяем..." : "Отметить"}
          </Button>
        </form>

        {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

        {result ? (
          <div className="rounded-[20px] border border-[#eee] px-5 py-4">
            <p className="text-[16px] font-medium text-[#eee]">
              {result.participant.firstName} {result.participant.lastName}
            </p>
            <p className="mt-1 text-[13px] text-[#9da1ab]">
              #{result.participant.code}
            </p>
            <p
              className={`mt-3 text-[14px] font-medium ${
                result.alreadyCheckedIn ? "text-[#d15a32]" : "text-[#43c510]"
              }`}
            >
              {result.alreadyCheckedIn
                ? "Уже был отмечен ранее"
                : "Успешный check-in"}
            </p>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
