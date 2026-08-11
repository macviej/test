import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-16 text-center">
        <p className="text-[120px] leading-none tracking-[-3px] text-[rgba(125,175,255,0.2)] sm:text-[160px]">
          404
        </p>
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col gap-4 text-[#eee]">
            <h1 className="text-[20px] font-semibold uppercase leading-7">
              Похоже, страница вознеслась
            </h1>
            <p className="text-[14px] font-light leading-5">
              Мы искали её повсюду, но так и не нашли. Попробуйте начать заново с
              главной страницы.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-1 rounded-[20px] border border-[#eee] bg-[#eee] py-3 pl-8 pr-7 text-[14px] font-semibold leading-[18px] text-black"
          >
            НА ГЛАВНУЮ
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/arrow-up-right.svg"
              alt=""
              className="size-5"
            />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
