"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const SKIP_PREFIXES = ["/admin", "/qa/screen"];

type Props = { children: ReactNode };

export function Preloader({ children }: Props) {
  const pathname = usePathname();
  const skip = SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const [progress, setProgress] = useState(1);
  const [phase, setPhase] = useState<"run" | "out" | "gone">(
    skip ? "gone" : "run",
  );

  useEffect(() => {
    if (skip) return;

    let raf = 0;
    let start = 0;

    const tick = (now: number) => {
      const next = Math.min(
        100,
        Math.max(1, Math.round(((now - start) / duration) * 100)),
      );
      setProgress(next);
      if (next < 100) {
        raf = requestAnimationFrame(tick);
        return;
      }
      try {
        sessionStorage.setItem("imago-preloader", "1");
      } catch {
        // ignore
      }
      window.setTimeout(() => setPhase("out"), 180);
      window.setTimeout(() => setPhase("gone"), 700);
    };

    const duration = 2200;
    raf = requestAnimationFrame(() => {
      try {
        if (sessionStorage.getItem("imago-preloader") === "1") {
          setPhase("gone");
          return;
        }
      } catch {
        // ignore
      }
      start = performance.now();
      raf = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(raf);
  }, [skip]);

  const showLogo = progress >= 55;

  return (
    <>
      {children}
      {phase !== "gone" ? (
        <div
          className={`fixed inset-0 z-[400] flex flex-col bg-black text-[#eee] transition-opacity duration-500 ${
            phase === "out" ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-hidden={phase !== "run"}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-black" />
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

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[402px] flex-col px-5 pb-10 pt-12">
            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/five-years.svg"
                alt=""
                className="h-[196px] w-[213px] object-contain opacity-90"
              />
              {showLogo ? (
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-in">
                  <Logo href={null} size="lg" />
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-between text-[12px] font-semibold uppercase leading-none tracking-wide text-[#eee]">
              <span>Загрузка...</span>
              <span>{String(progress).padStart(2, "0")}%</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
