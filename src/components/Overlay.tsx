import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
};

export function Overlay({ children, onClose, labelledBy }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 animate-fade-in"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-[362px] animate-dialog-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </div>
  );
}
