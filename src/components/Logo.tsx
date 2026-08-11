import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
};

export function Logo({ href = "/", className = "" }: LogoProps) {
  const content = (
    <div className={`flex w-[132px] flex-col items-end gap-[4.8px] ${className}`}>
      <div className="relative h-[26px] w-full">
        <span className="absolute left-0 top-[2px] whitespace-nowrap text-[28px] leading-none tracking-[-0.6px] text-[#eee]">
          imago de
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo-star.svg"
          alt=""
          className="absolute left-[113px] top-0 h-[10px] w-[20px]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo-i.svg"
          alt=""
          className="absolute left-[126px] top-[10px] h-[16px] w-[5px]"
        />
      </div>
      <p className="text-[12px] leading-none tracking-[-0.25px] text-[#eee]">
        conf <span className="text-[10px]">2026</span>
      </p>
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
