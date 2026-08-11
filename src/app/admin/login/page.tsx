"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        return;
      }
      router.push("/admin");
    } catch {
      setError("Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="relative flex flex-1 flex-col">
        <h1 className="text-center text-[18px] font-medium uppercase leading-6 text-[#eee]">
          Панель
          <br />
          Администратора
        </h1>

        <form
          onSubmit={onSubmit}
          className="absolute left-0 right-0 top-1/2 flex w-full -translate-y-1/2 flex-col gap-8"
        >
          <div className="flex flex-col gap-4">
            <Field
              label="Логин"
              placeholder="Логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              required
            />
            <Field
              label="Пароль"
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error ? <p className="text-[13px] text-[#d15a32]">{error}</p> : null}

          <div className="flex flex-col items-center gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Входим..." : "Войти"}
            </Button>
            <p className="text-[14px] font-light text-[#9da1ab]">
              Забыли пароль?
            </p>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
