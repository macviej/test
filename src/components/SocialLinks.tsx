import { SOCIAL_LINKS } from "@/lib/i18n";

type Props = {
  className?: string;
};

export function SocialLinks({ className = "" }: Props) {
  return (
    <div className={`flex items-start justify-center gap-5 ${className}`}>
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          className="relative flex size-10 items-center justify-center rounded-[20px] bg-[#eee]"
          aria-label={social.name}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={social.icon} alt="" className="size-6" />
        </a>
      ))}
    </div>
  );
}
