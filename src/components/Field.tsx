import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Field({ label, className = "", ...props }: Props) {
  return (
    <label className="flex w-full flex-col gap-3">
      <span className="text-[14px] font-medium leading-5 text-[#eee]">{label}</span>
      <input
        className={`w-full rounded-[20px] border border-[#eee] bg-transparent px-5 py-3 text-[14px] font-light leading-5 text-[#eee] outline-none placeholder:text-[#9da1ab] focus:border-white ${className}`}
        {...props}
      />
    </label>
  );
}
