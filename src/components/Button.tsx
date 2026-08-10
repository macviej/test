import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost" | "choice" | "choiceActive";
  arrow?: boolean;
};

export function Button({
  children,
  variant = "primary",
  arrow = false,
  className = "",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[20px] transition disabled:opacity-50";

  const variants = {
    primary:
      "h-[52px] w-full border border-[#eee] bg-[#eee] px-4 text-[16px] font-semibold uppercase text-black",
    ghost:
      "h-auto w-auto border-0 bg-transparent p-0 text-[14px] font-medium text-[#eee] underline-offset-4 hover:underline",
    choice:
      "h-[52px] flex-1 border border-[#eee] bg-transparent px-6 text-[14px] font-semibold uppercase text-[#eee]",
    choiceActive:
      "h-[52px] flex-1 border border-[#eee] bg-[#eee] px-6 text-[14px] font-semibold uppercase text-black",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      {arrow ? (
        <img src="/assets/arrow-up-right.svg" alt="" className="size-6" />
      ) : null}
    </button>
  );
}
