import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";

const chips = [
  "Боровляны, Первомайская 23",
  "30 BYN",
  "7 ноября",
  "10:00",
];

export default function WelcomePage() {
  return (
    <AppShell
      headerRight={
        <button
          type="button"
          className="flex items-center gap-1 pl-[5px] text-[14px] font-medium leading-5 text-[#eee]"
          aria-label="Язык"
        >
          RU
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/chevron-down.svg" alt="" className="size-5" />
        </button>
      }
    >
      <div className="relative flex flex-1 flex-col items-center justify-between">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[282px] w-[305px] -translate-x-1/2 -translate-y-[52%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/five-years.svg"
            alt=""
            className="h-full w-full object-contain opacity-90"
          />
        </div>

        <div className="relative w-full max-w-[362px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/ticket-bg.svg"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          <div className="relative z-10 flex flex-col items-center gap-12 px-5 py-6">
            <div className="flex w-full flex-col items-center gap-6 text-center text-[#eee]">
              <h1 className="text-[18px] font-medium uppercase leading-6">
                Добро пожаловать на
                <br />
                IMAGO DEI CONF 2026!
              </h1>
              <p className="text-[14px] font-light leading-5">
                В этом году нашей конференции исполняется 5 лет. Уже пятый год
                мы собираемся вместе, чтобы изучать Божье Слово, общаться,
                задавать важные вопросы и возрастать в познании Бога.
              </p>
            </div>

            <div className="flex flex-wrap content-start items-start justify-center gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[20px] border border-[#eee] px-4 py-2 text-[12px] font-medium leading-4 text-[#eee]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Link href="/register" className="mt-auto w-full shrink-0">
          <Button arrow>Зарегистрироваться</Button>
        </Link>
      </div>
    </AppShell>
  );
}
