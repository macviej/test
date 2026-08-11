"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import { Logo } from "@/components/Logo";
import type { Participant } from "@/lib/types";
import { useAdminGuard } from "@/lib/use-admin-guard";

type CheckInResult = {
  participant: Participant;
  alreadyCheckedIn: boolean;
};

export default function AdminScannerPage() {
  const ready = useAdminGuard();
  const [manualCode, setManualCode] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
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

  useEffect(() => {
    if (!ready || scanning || result) return;
    void startScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function checkIn(code: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setError("");
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
      setManualOpen(false);
    } catch {
      setError("Не удалось отметить участника");
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }

  async function startScanner() {
    setError("");
    setResult(null);
    setScanning(true);
    await new Promise((resolve) => setTimeout(resolve, 50));
    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {
          // ignore
        }
        scannerRef.current = null;
      }
      const scanner = new Html5Qrcode("admin-qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 232, height: 232 } },
        (decoded) => {
          void checkIn(decoded);
        },
        () => undefined,
      );
    } catch {
      setScanning(false);
      scannerRef.current = null;
      setError("Камера недоступна — введите код вручную");
      setManualOpen(true);
    }
  }

  async function onShutter() {
    if (result) {
      setResult(null);
      setError("");
      if (!scanning) await startScanner();
      return;
    }
    setManualOpen((v) => !v);
  }

  async function onManualSubmit(event: FormEvent) {
    event.preventDefault();
    await checkIn(manualCode);
  }

  if (!ready) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center bg-black text-[#eee]">
        <p className="text-[14px] text-[#9da1ab]">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-[#eee]">
      <div className="absolute inset-0 z-0 bg-black">
        <div
          id="admin-qr-reader"
          className={`absolute inset-0 h-full w-full overflow-hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover ${
            scanning ? "" : "hidden"
          }`}
        />
        {!scanning ? (
          <div className="absolute inset-0 bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/stars-bg.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-bottom opacity-60 mix-blend-hard-light"
            />
            <div
              className="absolute inset-0"
              style={{
                boxShadow:
                  "inset 0px 24px 24px -8px rgba(35,101,255,0.15), inset 0px -83px 83px -25px rgba(255,255,255,0.4), inset 0px -166px 124px -33px rgba(102,148,255,0.5), inset 0px -331px 249px -124px #144ccd",
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[402px] flex-col px-5 pb-8 pt-5">
        <header className="relative mb-8 flex h-10 shrink-0 items-center justify-center">
          <Link
            href="/admin"
            className="absolute left-0 top-1/2 flex h-6 w-[30px] -translate-y-1/2 items-center justify-center"
            aria-label="Назад"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/back.svg" alt="" className="h-6 w-[30px]" />
          </Link>
          <Logo />
        </header>

        <div className="relative flex flex-1 flex-col items-center justify-end">
          <div className="pointer-events-none absolute left-1/2 top-[calc(50%-34px)] size-[232px] -translate-x-1/2 -translate-y-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/scanner-frame.svg"
              alt=""
              className="size-[232px]"
            />
          </div>

          {result ? (
            <div className="absolute left-1/2 top-[calc(50%-34px)] w-[min(100%,280px)] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-[#eee] bg-black/80 px-5 py-4 text-center backdrop-blur-sm">
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

          {error && !result ? (
            <p className="mb-4 max-w-[280px] text-center text-[13px] text-[#d15a32]">
              {error}
            </p>
          ) : null}

          {manualOpen && !result ? (
            <form
              onSubmit={onManualSubmit}
              className="mb-6 flex w-full flex-col gap-3"
            >
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="IGC-2026-001"
                className="w-full rounded-[20px] border border-[#eee] bg-black/60 px-5 py-3 text-center text-[14px] text-[#eee] outline-none placeholder:text-[#9da1ab]"
              />
              <button
                type="submit"
                disabled={loading || !manualCode.trim()}
                className="h-[44px] rounded-[20px] bg-[#eee] text-[14px] font-semibold uppercase text-black disabled:opacity-50"
              >
                {loading ? "Проверяем..." : "Отметить"}
              </button>
            </form>
          ) : null}

          <button
            type="button"
            onClick={onShutter}
            aria-label={result ? "Сканировать дальше" : "Ввод кода"}
            className="relative size-[56px] shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/scanner-shutter.svg"
              alt=""
              className="size-[56px]"
            />
          </button>
        </div>
      </div>

      <style>{`
        #admin-qr-reader {
          border: none !important;
        }
        #admin-qr-reader > div {
          border: none !important;
          box-shadow: none !important;
        }
        #admin-qr-reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
        #admin-qr-reader img {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
