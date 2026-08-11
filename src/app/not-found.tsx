"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { notFoundCopy } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";

export default function NotFound() {
  const { locale, setLocale } = useLocale();
  const t = notFoundCopy[locale];

  return (
    <AppShell
      headerRight={<LanguageSwitcher value={locale} onChange={setLocale} />}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-16 text-center">
        <p className="text-[120px] leading-none tracking-[-3px] text-[rgba(125,175,255,0.2)] sm:text-[160px]">
          404
        </p>
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col gap-4 text-[#eee]">
            <h1 className="text-[20px] font-semibold uppercase leading-7">
              {t.title}
            </h1>
            <p className="text-[14px] font-light leading-5">{t.body}</p>
          </div>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-1 rounded-[20px] border border-[#eee] bg-[#eee] py-3 pl-8 pr-7 text-[14px] font-semibold leading-[18px] text-[#000]"
          >
            <span className="text-[#000]">{t.home}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/arrow-up-right.svg" alt="" className="size-5" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
