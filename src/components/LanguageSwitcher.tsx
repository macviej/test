"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/lib/i18n";

const OPTIONS: Locale[] = ["RU", "EN", "BY"];

function subscribe() {
  return () => undefined;
}

type Props = {
  value: Locale;
  onChange: (locale: Locale) => void;
};

export function LanguageSwitcher({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function select(next: Locale) {
    onChange(next);
    setOpen(false);
  }

  const others = OPTIONS.filter((item) => item !== value);

  const menu =
    open && mounted
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[200] flex w-[53px] animate-dropdown-in flex-col items-start gap-1 px-[5px] text-[14px] font-medium leading-5 text-[#eee]"
            style={{ top: pos.top, right: pos.right }}
          >
            {others.map((item) => (
              <button
                key={item}
                type="button"
                className="w-full text-left opacity-80 transition-opacity duration-200 hover:opacity-100 hover:tracking-wide"
                onClick={() => select(item)}
              >
                {item}
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative h-6 w-[53px]">
      <button
        type="button"
        className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1 pl-[5px] text-[14px] font-medium leading-5 text-[#eee] transition-opacity duration-200 hover:opacity-80"
        aria-label="Language"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {value}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/chevron-down.svg"
          alt=""
          className={`size-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {menu}
    </div>
  );
}
