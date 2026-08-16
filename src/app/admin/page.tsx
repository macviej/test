"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { useAdminGuard } from "@/lib/use-admin-guard";

export default function AdminHomePage() {
  const ready = useAdminGuard();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <AppShell>
        <p className="mt-20 text-center text-[14px] text-[#9da1ab]">Загрузка...</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      headerRight={
        <button
          type="button"
          onClick={logout}
          aria-label="Выйти"
          className="admin-icon-btn size-6 hover:rotate-12"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logout.svg" alt="" className="size-6" />
        </button>
      }
    >
      <div className="relative flex flex-1 flex-col">
        <h1 className="text-center text-[18px] font-medium uppercase leading-6 text-[#eee]">
          Панель
          <br />
          Администратора
        </h1>

        <div className="absolute left-1/2 top-1/2 flex w-[240px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6">
          <Link href="/admin/scanner" className="w-full">
            <Button type="button" className="w-full">
              Сканер QR
            </Button>
          </Link>
          <Link href="/admin/participants" className="w-full">
            <Button type="button" variant="outline" className="w-full">
              Таблица
            </Button>
          </Link>
          <Link href="/admin/qa" className="w-full">
            <Button type="button" variant="outline" className="w-full">
              Q&A
            </Button>
          </Link>
          <a
            href="/qa/screen"
            target="_blank"
            rel="noreferrer"
            className="w-full"
          >
            <Button type="button" variant="outline" className="w-full">
              Проектор
            </Button>
          </a>
        </div>
      </div>
    </AppShell>
  );
}
