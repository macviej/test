"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Overlay } from "@/components/Overlay";
import { SocialLinks } from "@/components/SocialLinks";
import { getTicketCtaMode, ticketCopy } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";
import type { LunchType } from "@/lib/types";

type TicketPayload = {
  participant: {
    code: string;
    firstName: string;
    lastName: string;
    phone: string;
    telegram: string;
    email: string;
    needsLunch: boolean | null;
    lunchType: LunchType | null;
    hasAllergy: boolean | null;
    allergyNote: string;
  };
  qrDataUrl: string;
};

export default function TicketPage() {
  const params = useParams<{ code: string }>();
  const { locale, setLocale } = useLocale();
  const t = ticketCopy[locale];
  const ctaMode = getTicketCtaMode();
  const [data, setData] = useState<TicketPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/ticket/${params.code}`);
        const json = await response.json();
        if (!response.ok) {
          setError(json.error || t.notFound);
          return;
        }
        setData(json);
      } catch {
        setError(t.loadError);
      } finally {
        setLoading(false);
      }
    }
    if (params.code) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per code
  }, [params.code]);

  function inviteFriend() {
    if (!data) return;
    if (navigator.share) {
      navigator.share({
        title: "Imago Dei Conf 2026",
        text: t.inviteShare,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert(t.linkCopied);
    }
  }

  const p = data?.participant;

  function lunchSummary() {
    if (!p || p.needsLunch === null) return "—";
    if (!p.needsLunch) return t.lunchNo;
    const kind =
      p.lunchType === "vegan"
        ? t.lunchVegan
        : p.lunchType === "standard"
          ? t.lunchStandard
          : t.lunchYes;
    const allergy =
      p.hasAllergy === true
        ? `${t.allergy}: ${p.allergyNote || "—"}`
        : `${t.allergy}: ${t.allergyNone}`;
    return `${kind}. ${allergy}`;
  }

  return (
    <AppShell
      headerLeft={
        <button
          type="button"
          className="flex size-[30px] items-center justify-center"
          aria-label={t.info}
          onClick={() => setInfoOpen(true)}
          disabled={!data}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/info.svg" alt="" className="size-[30px]" />
        </button>
      }
      headerRight={<LanguageSwitcher value={locale} onChange={setLocale} />}
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        {loading ? (
          <p className="mt-20 text-center text-[14px] text-[#9da1ab]">
            {t.loading}
          </p>
        ) : error ? (
          <p className="mt-20 text-center text-[14px] text-[#d15a32]">{error}</p>
        ) : data && p ? (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto animate-stage-in">
              <div className="flex flex-col gap-4 text-center">
                <h1 className="text-[20px] font-semibold uppercase leading-7 text-[#eee]">
                  {t.thanks}
                </h1>
                <p className="text-[14px] font-light leading-5 text-[#eee]">
                  {t.body}
                </p>
              </div>

              <div className="mx-auto mt-10 flex w-[240px] flex-col items-center gap-4">
                <div className="rounded-[16px] bg-white p-3 animate-dialog-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.qrDataUrl}
                    alt={`QR ${p.code}`}
                    className="size-[216px]"
                  />
                </div>
                <p className="text-center text-[20px] font-semibold uppercase leading-7 text-[#eee]">
                  #{p.code}
                </p>
              </div>

            </div>

            <div className="mt-auto flex shrink-0 flex-col gap-3 pt-6">
              <Link href="/qa" className="w-full">
                <Button type="button" arrow>
                  {t.askQuestion}
                </Button>
              </Link>
              {ctaMode === "invite" ? (
                <Button type="button" variant="outline" arrow onClick={inviteFriend}>
                  {t.invite}
                </Button>
              ) : null}
              {ctaMode === "invite" ? (
                <div className="flex flex-col items-center gap-1 pb-1 pt-2 text-center">
                  <p className="w-full text-[14px] font-light leading-5 text-[#eee]">
                    {t.cantCome}
                  </p>
                  <Button
                    variant="textArrow"
                    arrow
                    type="button"
                    onClick={() => alert(t.cancelSoon)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      {infoOpen && p ? (
        <Overlay onClose={() => setInfoOpen(false)} labelledBy="ticket-info">
          <div className="w-full overflow-hidden rounded-[28px] border border-[#eee]/20 bg-[#0b1020]/95 px-5 py-5 shadow-[0_0_40px_rgba(20,76,205,0.35)] backdrop-blur-md">
            <div className="mb-5 flex flex-wrap gap-2">
              {t.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[20px] border border-[#eee] px-4 py-2 text-[12px] font-medium leading-4 text-[#eee]"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <h2
                id="ticket-info"
                className="text-center text-[18px] font-medium uppercase leading-6 text-[#eee]"
              >
                {t.yourData}
              </h2>
              <div className="flex flex-col gap-2 text-[14px] font-light leading-5 text-[#eee]">
                <p>
                  {p.firstName} {p.lastName}
                </p>
                <p>{p.phone}</p>
                {p.telegram ? <p>@{p.telegram.replace(/^@/, "")}</p> : null}
                <p>{p.email}</p>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[16px] font-medium leading-5 text-[#eee]">
                  {t.lunch}
                </p>
                <p className="text-[14px] font-light leading-5 text-[#eee]">
                  {lunchSummary()}
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <p className="text-[14px] font-medium leading-5 text-[#eee]">
                  {t.followUs}
                </p>
                <SocialLinks />
              </div>
              <Button type="button" onClick={() => setInfoOpen(false)}>
                {t.close}
              </Button>
            </div>
          </div>
        </Overlay>
      ) : null}
    </AppShell>
  );
}
