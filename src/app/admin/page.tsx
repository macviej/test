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
    <AppShell>
      <div className="flex flex-1 flex-col">
        <h1 className="mb-10 text-center text-[18px] font-medium uppercase leading-6 text-[#eee]">
          Панель
          <br />
          Администратора
        </h1>

        <div className="mt-auto flex flex-col gap-4 pb-4">
          <Link href="/admin/scanner" className="w-full">
            <Button type="button">QR Code</Button>
          </Link>
          <Link href="/admin/participants" className="w-full">
            <Button type="button">Spreadsheet</Button>
          </Link>
          <Link href="/admin/qa" className="w-full">
            <Button type="button">Q&A</Button>
          </Link>
          <Button type="button" variant="ghost" className="mt-2" onClick={logout}>
            Выйти
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
