"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { CookieBanner } from "@/components/CookieBanner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SocialLinks } from "@/components/SocialLinks";
import {
  COOKIES_STORAGE_KEY,
  getRegistrationStatus,
  getWelcomeCopy,
} from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";

function subscribeStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function readCookiesOk(): boolean {
  return localStorage.getItem(COOKIES_STORAGE_KEY) === "1";
}

export default function WelcomePage() {
  const status = getRegistrationStatus();
  const { locale, setLocale } = useLocale();
  const cookiesOk = useSyncExternalStore(subscribeStorage, readCookiesOk, () => true);

  const acceptCookies = useCallback(() => {
    localStorage.setItem(COOKIES_STORAGE_KEY, "1");
    window.dispatchEvent(new Event("storage"));
  }, []);

  const copy = getWelcomeCopy(locale, status);
  const showCookies = !cookiesOk;

  return (
    <AppShell headerRight={<LanguageSwitcher value={locale} onChange={setLocale} />}>
      <div
        className={`relative flex flex-1 flex-col items-center ${
          status === "open" ? "justify-between" : "justify-center"
        }`}
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[282px] w-[305px] -translate-x-1/2 -translate-y-[52%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/five-years.svg"
            alt=""
            className="h-full w-full object-contain opacity-90"
          />
        </div>

        <div className="relative w-full max-w-[362px] shrink-0 animate-stage-in stagger-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/ticket-bg.svg"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          <div
            className={`relative flex flex-col items-center px-5 py-6 ${
              status === "ended" ? "gap-0" : "gap-12"
            }`}
          >
            <div className="flex w-full flex-col items-center gap-6 text-center text-[#eee]">
              <h1 className="text-[18px] font-medium uppercase leading-6">
                {copy.titleLine1}
                <br />
                {copy.titleLine2}
              </h1>
              <p className="whitespace-pre-line text-[14px] font-light leading-5">
                {copy.body}
              </p>
            </div>

            {copy.chips.length > 0 ? (
              <div className="flex flex-wrap content-start items-start justify-center gap-2">
                {copy.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-[20px] border border-[#eee] px-4 py-2 text-[12px] font-medium leading-4 text-[#eee]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}

            {status === "ended" ? <SocialLinks className="px-5 py-6" /> : null}
          </div>
        </div>

        {status === "open" && copy.cta ? (
          <div className="mt-auto flex w-full shrink-0 flex-col gap-3 animate-stage-in [animation-delay:180ms]">
            <Link href="/register" className="w-full">
              <Button arrow>{copy.cta}</Button>
            </Link>
            {copy.ticketLogin ? (
              <Link href="/ticket" className="w-full">
                <Button type="button" variant="outline">
                  {copy.ticketLogin}
                </Button>
              </Link>
            ) : null}
          </div>
        ) : null}

        {status === "closed" && copy.ticketLogin ? (
          <div className="mt-auto flex w-full shrink-0 flex-col gap-3 animate-stage-in [animation-delay:180ms]">
            <Link href="/ticket" className="w-full">
              <Button type="button" variant="outline" className="w-full">
                {copy.ticketLogin}
              </Button>
            </Link>
          </div>
        ) : null}

        {showCookies ? (
          <CookieBanner
            text={copy.cookiesText}
            okLabel={copy.cookiesOk}
            onAccept={acceptCookies}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
