import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldText =
  "text-[14px] font-light leading-5 text-[#eee] outline-none placeholder:text-[#9da1ab]";
const fieldBox =
  "w-full rounded-[20px] border border-[#eee] bg-transparent px-5 py-3 transition-colors duration-200 hover:border-white/80 focus-within:border-white focus:border-white";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  prefix?: string;
  hint?: string;
};

export function Field({
  label,
  prefix,
  hint,
  className = "",
  value,
  onChange,
  ...props
}: FieldProps) {
  return (
    <label className="flex w-full flex-col gap-3">
      <span className="text-[14px] font-medium leading-5 text-[#eee]">
        {label}
      </span>
      {prefix ? (
        <div className={`flex items-center ${fieldBox}`}>
          <span className={`shrink-0 ${fieldText}`}>{prefix}</span>
          <input
            className={`min-w-0 flex-1 bg-transparent ${fieldText} ${className}`}
            value={value}
            onChange={onChange}
            {...props}
          />
        </div>
      ) : (
        <input
          className={`${fieldBox} ${fieldText} ${className}`}
          value={value}
          onChange={onChange}
          {...props}
        />
      )}
      {hint ? (
        <span className="text-[12px] font-light leading-4 text-[#9da1ab]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function TextAreaField({
  label,
  hint,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    <label className="flex w-full flex-col gap-3">
      <span className="text-[14px] font-medium leading-5 text-[#eee]">
        {label}
      </span>
      <textarea
        className={`${fieldBox} min-h-[88px] resize-none ${fieldText} ${className}`}
        {...props}
      />
      {hint ? (
        <span className="text-[12px] font-light leading-4 text-[#9da1ab]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
};

export function SelectField({
  label,
  placeholder,
  options,
  className = "",
  value,
  ...props
}: SelectProps) {
  const empty = !value;
  return (
    <label className="flex w-full flex-col gap-3">
      <span className="text-[14px] font-medium leading-5 text-[#eee]">
        {label}
      </span>
      <div className={`relative ${fieldBox} pr-12`}>
        <select
          className={`w-full appearance-none bg-transparent ${fieldText} ${
            empty ? "text-[#9da1ab]" : ""
          } ${className}`}
          value={value}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-black">
              {option.label}
            </option>
          ))}
        </select>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/chevron-down.svg"
          alt=""
          className="pointer-events-none absolute right-4 top-1/2 size-6 -translate-y-1/2"
        />
      </div>
    </label>
  );
}
