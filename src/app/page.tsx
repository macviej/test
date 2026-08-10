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
          className="flex items-center gap-1 pl-1 text-[14px] font-medium text-[#eee]"
          aria-label="Язык"
        >
          RU
          <img src="/assets/chevron-down.svg" alt="" className="size-5" />
        </button>
      }
    >
      <div className="relative flex flex-1 flex-col items-center justify-between gap-8">
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-[280px] -translate-x-1/2 -translate-y-[58%] opacity-80">
          <img src="/assets/five-years.svg" alt="" className="h-auto w-full" />
        </div>

        <div className="relative mt-8 w-full overflow-hidden rounded-[28px] px-5 py-6">
          <img
            src="/assets/ticket-bg.svg"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-[18px] font-medium uppercase leading-6 text-[#eee]">
                Добро пожаловать на
                <br />
                IMAGO DEI CONF 2026!
              </h1>
              <p className="text-[14px] font-light leading-5 text-[#eee]">
                В этом году нашей конференции исполняется 5 лет. Уже пятый год
                мы собираемся вместе, чтобы изучать Божье Слово, общаться,
                задавать важные вопросы и возрастать в познании Бога.
              </p>
            </div>

            <div className="flex flex-wrap items-start justify-center gap-2">
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

        <Link href="/register" className="mt-auto w-full">
          <Button arrow>Зарегистрироваться</Button>
        </Link>
      </div>
    </AppShell>
  );
}
