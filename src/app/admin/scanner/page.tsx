"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import type { Participant } from "@/lib/types";
import { extractParticipantCode } from "@/lib/ticket-code";
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
  const scannerRef = useRef<{
    stop: () => Promise<void>;
    clear: () => void;
  } | null>(null);
  const busyRef = useRef(false);
  const pausedRef = useRef(false);

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

  async function checkIn(raw: string) {
    const code = extractParticipantCode(raw) || raw.trim();
    if (!code || busyRef.current) return;
    busyRef.current = true;
    pausedRef.current = true;
    setLoading(true);
    setError("");
    try {
      await scannerRef.current?.stop().catch(() => undefined);
    } catch {
      // ignore
    }
    try {
      const res = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка");
        pausedRef.current = false;
        await startScanner();
        return;
      }
      setResult(data);
      setManualCode("");
      setManualOpen(false);
      setScanning(false);
    } catch {
      setError("Не удалось отметить участника");
      pausedRef.current = false;
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }

  async function startScanner() {
    setError("");
    setResult(null);
    pausedRef.current = false;
    setScanning(true);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await new Promise((resolve) => setTimeout(resolve, 120));
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
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
        "html5-qrcode"
      );
      const scanner = new Html5Qrcode("admin-qr-reader", {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      });
      scannerRef.current = scanner;
      const cameras = await Html5Qrcode.getCameras().catch(() => []);
      const backCam = cameras.find((cam) =>
        /back|rear|environment|задн/i.test(cam.label),
      );
      const cameraConfig = backCam?.id || { facingMode: "environment" };
      await scanner.start(
        cameraConfig,
        {
          fps: 12,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.max(
              140,
              Math.min(220, viewfinderWidth, viewfinderHeight) * 0.82,
            );
            return { width: size, height: size };
          },
          aspectRatio: 1,
          disableFlip: false,
        },
        (decoded) => {
          if (pausedRef.current) return;
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
      <div className="flex min-h-0 flex-1 flex-col items-center">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6">
          <div className="relative size-[232px] overflow-hidden rounded-[36px] bg-black/40 shadow-[0_0_40px_rgba(20,76,205,0.25)]">
            <div
              id="admin-qr-reader"
              className="absolute inset-0 overflow-hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/scanner-frame.svg"
              alt=""
              className="pointer-events-none absolute inset-0 size-[232px]"
            />
            {result ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 px-4 text-center backdrop-blur-sm">
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

          {error && !result ? (
            <p className="max-w-[280px] text-center text-[13px] text-[#d15a32]">
              {error}
            </p>
          ) : null}

          {result ? (
            <Button type="button" className="w-[240px]" onClick={() => void startScanner()}>
              Дальше
            </Button>
          ) : manualOpen ? (
            <form
              onSubmit={onManualSubmit}
              className="flex w-[240px] flex-col gap-3"
            >
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="IDC-2026-001"
                className="w-full rounded-[20px] border border-[#eee] bg-transparent px-5 py-3 text-center text-[14px] text-[#eee] outline-none placeholder:text-[#9da1ab] transition-colors duration-200 hover:border-white/80 focus:border-white"
              />
              <Button
                type="submit"
                disabled={loading || !manualCode.trim()}
              >
                {loading ? "Проверяем..." : "Отметить"}
              </Button>
              <button
                type="button"
                onClick={() => setManualOpen(false)}
                className="admin-text-action text-center text-[13px] text-[#9da1ab] hover:text-[#eee]"
              >
                Скрыть
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setManualOpen(true)}
              className="admin-text-action text-[13px] text-[#9da1ab] underline hover:text-[#eee]"
            >
              Ввести код вручную
            </button>
          )}
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
        #admin-qr-reader img,
        #admin-qr-reader input,
        #admin-qr-reader select,
        #admin-qr-reader button {
          display: none !important;
        }
      `}</style>
    </AppShell>
  );
}
