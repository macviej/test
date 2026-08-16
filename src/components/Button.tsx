import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?:
    | "primary"
    | "outline"
    | "ghost"
    | "choice"
    | "choiceActive"
    | "textArrow";
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
    "group inline-flex items-center justify-center transition-all duration-300 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary:
      "h-[52px] w-full gap-2 rounded-[20px] border border-[#eee] bg-[#eee] py-5 pl-4 pr-[9px] text-[16px] font-semibold uppercase leading-5 text-black hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_28px_rgba(238,238,238,0.28)]",
    outline:
      "h-[52px] w-full gap-2 rounded-[20px] border border-[#eee] bg-transparent py-5 pl-4 pr-[9px] text-[16px] font-semibold uppercase leading-5 text-[#eee] hover:-translate-y-0.5 hover:bg-[#eee] hover:text-black hover:shadow-[0_8px_22px_rgba(238,238,238,0.18)]",
    ghost:
      "h-auto w-auto gap-0 border-0 bg-transparent p-0 text-[14px] font-semibold leading-5 text-[#eee] hover:text-white hover:opacity-80",
    choice:
      "h-auto flex-1 gap-1 rounded-[20px] border border-[#eee] bg-transparent py-4 pl-8 pr-7 text-[14px] font-semibold leading-[18px] text-[#eee] hover:bg-white/15 hover:border-white",
    choiceActive:
      "h-auto flex-1 gap-1 rounded-[20px] border border-[#eee] bg-[#eee] py-4 pl-8 pr-7 text-[14px] font-semibold leading-[18px] text-black hover:bg-white hover:shadow-[0_8px_20px_rgba(238,238,238,0.2)]",
    textArrow:
      "h-auto w-auto gap-0.5 rounded-[20px] border-0 bg-transparent py-0 pl-1.5 pr-0 text-[14px] font-semibold leading-[18px] text-[#eee] hover:gap-1.5 hover:text-white",
  };

  const arrowSrc =
    variant === "primary"
      ? "/assets/arrow-up-right.svg"
      : "/assets/arrow-up-right-light.svg";
  const arrowSize = variant === "textArrow" ? "size-5" : "size-6";
  const arrowHover =
    variant === "outline"
      ? "transition duration-300 group-hover:invert"
      : variant === "textArrow"
        ? "transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        : "transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5";

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      {arrow ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={arrowSrc} alt="" className={`${arrowSize} ${arrowHover}`} />
      ) : null}
    </button>
  );
}
