import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost" | "choice" | "choiceActive" | "textArrow";
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
    "inline-flex items-center justify-center transition disabled:opacity-50";

  const variants = {
    primary:
      "h-[52px] w-full gap-2 rounded-[20px] border border-[#eee] bg-[#eee] py-5 pl-4 pr-[9px] text-[16px] font-semibold uppercase leading-5 text-black",
    ghost:
      "h-auto w-auto gap-0 border-0 bg-transparent p-0 text-[14px] font-medium leading-5 text-[#eee]",
    choice:
      "h-auto flex-1 gap-1 rounded-[20px] border border-[#eee] bg-transparent py-4 pl-8 pr-7 text-[14px] font-semibold leading-[18px] text-[#eee]",
    choiceActive:
      "h-auto flex-1 gap-1 rounded-[20px] border border-[#eee] bg-[#eee] py-4 pl-8 pr-7 text-[14px] font-semibold leading-[18px] text-black",
    textArrow:
      "h-auto w-auto gap-0.5 rounded-[20px] border-0 bg-transparent py-0 pl-1.5 pr-0 text-[14px] font-semibold leading-[18px] text-[#eee]",
  };

  const arrowSrc =
    variant === "primary"
      ? "/assets/arrow-up-right.svg"
      : "/assets/arrow-up-right-light.svg";
  const arrowSize = variant === "textArrow" ? "size-5" : "size-6";

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      {arrow ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={arrowSrc} alt="" className={arrowSize} />
      ) : null}
    </button>
  );
}
