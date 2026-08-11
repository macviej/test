"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

const OPTIONS: Locale[] = ["RU", "EN", "BY"];

type Props = {
  value: Locale;
  onChange: (locale: Locale) => void;
};

export function LanguageSwitcher({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function select(next: Locale) {
    onChange(next);
    setOpen(false);
  }

  const others = OPTIONS.filter((item) => item !== value);

  return (
    <div ref={rootRef} className="relative h-6 w-[53px]">
      <button
        type="button"
        className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1 pl-[5px] text-[14px] font-medium leading-5 text-[#eee]"
        aria-label="Language"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {value}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/chevron-down.svg"
          alt=""
          className={`size-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="absolute left-0 top-[26px] flex w-[53px] flex-col items-start gap-1 px-[5px] text-[14px] font-medium leading-5 text-[#eee]">
          {others.map((item) => (
            <button
              key={item}
              type="button"
              className="w-full text-left"
              onClick={() => select(item)}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
