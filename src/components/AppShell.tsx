import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

type Props = {
  children: ReactNode;
  showBack?: boolean;
  backHref?: string;
  headerRight?: ReactNode;
};

export function AppShell({
  children,
  showBack = false,
  backHref = "/",
  headerRight,
}: Props) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-[#eee]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-black" />
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

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-5 pb-8 pt-5">
        <header className="relative mb-8 flex h-10 items-center justify-center">
          {showBack ? (
            <Link
              href={backHref}
              className="absolute left-0 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center"
              aria-label="Назад"
            >
              <img src="/assets/back.svg" alt="" className="h-6 w-[30px]" />
            </Link>
          ) : null}
          <Logo />
          {headerRight ? (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              {headerRight}
            </div>
          ) : null}
        </header>
        {children}
      </div>
    </div>
  );
}
