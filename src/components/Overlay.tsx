"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
};

function subscribe() {
  return () => undefined;
}

export function Overlay({ children, onClose, labelledBy }: Props) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 animate-fade-in"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div
        className="relative z-10 mx-auto w-full max-w-[402px] px-5 animate-dialog-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
