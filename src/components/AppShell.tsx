import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

type Props = {
  children: ReactNode;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
};

export function AppShell({
  children,
  showBack = false,
  backHref = "/",
  onBack,
  headerLeft,
  headerRight,
}: Props) {
  const backControl = onBack ? (
    <button
      type="button"
      onClick={onBack}
      className="flex h-6 w-[30px] items-center justify-center"
      aria-label="Назад"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/back.svg" alt="" className="h-6 w-[30px]" />
    </button>
  ) : (
    <Link
      href={backHref}
      className="flex h-6 w-[30px] items-center justify-center"
      aria-label="Назад"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/back.svg" alt="" className="h-6 w-[30px]" />
    </Link>
  );

  return (
    <div className="relative h-dvh overflow-hidden bg-black text-[#eee]">
      <div className="pointer-events-none fixed inset-0">
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

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[402px] flex-col px-5 pb-8 pt-5">
        <header className="relative z-[100] mb-8 flex h-10 shrink-0 items-center justify-center overflow-visible">
          {showBack || headerLeft ? (
            <div className="absolute left-0 top-1/2 z-[100] flex -translate-y-1/2 items-center gap-2">
              {showBack ? backControl : null}
              {headerLeft}
            </div>
          ) : null}
          <Logo />
          {headerRight ? (
            <div className="absolute right-0 top-1/2 z-[100] -translate-y-1/2">
              {headerRight}
            </div>
          ) : null}
        </header>
        <div className="relative z-0 flex min-h-0 flex-1 flex-col animate-stage-in">
          {children}
        </div>
      </div>
    </div>
  );
}
