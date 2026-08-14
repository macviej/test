"use client";

import { Overlay } from "./Overlay";

type Props = {
  text: string;
  okLabel: string;
  onAccept: () => void;
};

export function CookieBanner({ text, okLabel, onAccept }: Props) {
  return (
    <Overlay onClose={onAccept} labelledBy="cookies-title">
      <div
        className="flex w-full flex-col items-center gap-6 rounded-[20px] p-5"
        style={{
          backgroundImage:
            "linear-gradient(156.72deg, rgba(25, 29, 38, 0.7) 0%, rgba(30, 39, 59, 0.7) 22.665%, rgba(57, 75, 116, 0.7) 50.069%, rgba(30, 39, 59, 0.7) 72.665%, rgba(25, 29, 38, 0.7) 100.07%), linear-gradient(90deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.9) 100%)",
        }}
      >
        <div className="flex w-full items-center gap-6">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-clip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/cookie.svg" alt="" className="size-[26.67px]" />
          </div>
          <p
            id="cookies-title"
            className="flex-1 text-[14px] font-light leading-5 text-[#eee]"
          >
            {text}
          </p>
        </div>
        <button
          type="button"
          onClick={onAccept}
          className="inline-flex h-auto w-full items-center justify-center rounded-[20px] border border-[#eee] bg-[#eee] px-8 py-4 text-[14px] font-semibold leading-[18px] text-black"
        >
          {okLabel}
        </button>
      </div>
    </Overlay>
  );
}
