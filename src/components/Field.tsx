import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  prefix?: string;
};

export function Field({
  label,
  prefix,
  className = "",
  value,
  onChange,
  ...props
}: Props) {
  return (
    <label className="flex w-full flex-col gap-3">
      <span className="text-[14px] font-medium leading-5 text-[#eee]">
        {label}
      </span>
      {prefix ? (
        <div className="flex w-full items-center rounded-[20px] border border-[#eee] bg-transparent px-5 py-3 transition-colors duration-200 hover:border-white/80 focus-within:border-white">
          <span className="shrink-0 text-[14px] font-light leading-5 text-[#eee]">
            {prefix}
          </span>
          <input
            className={`min-w-0 flex-1 bg-transparent text-[14px] font-light leading-5 text-[#eee] outline-none placeholder:text-[#9da1ab] ${className}`}
            value={value}
            onChange={onChange}
            {...props}
          />
        </div>
      ) : (
        <input
          className={`w-full rounded-[20px] border border-[#eee] bg-transparent px-5 py-3 text-[14px] font-light leading-5 text-[#eee] outline-none placeholder:text-[#9da1ab] transition-colors duration-200 hover:border-white/80 focus:border-white ${className}`}
          value={value}
          onChange={onChange}
          {...props}
        />
      )}
    </label>
  );
}
