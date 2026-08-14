# Imago Dei Conf 2026

Веб-приложение регистрации на конференцию.

## Стек

Next.js + TypeScript + Tailwind · деплой на Vercel

## Сейчас

1. Welcome + регистрация + QR
2. Админка: логин, список, сканер check-in
3. Q&A: вопросы, лайки, модерация

## Запуск

```bash
npm install
npm run dev
```

Открыть http://localhost:3002

- Q&A: http://localhost:3002/qa
- Админка: http://localhost:3002/admin/login (логин/пароль из `.env.local`)

## Прод (Vercel)

https://imagodeiconf.vercel.app

Админка: https://imagodeiconf.vercel.app/admin/login  
Креды задаются в Vercel → Environment Variables: `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `ADMIN_SECRET` (в проде дефолта `admin`/`admin` больше нет).

На билете по умолчанию показываются «Пригласить друга» и «Отменить регистрацию». За неделю до конференции поставьте `NEXT_PUBLIC_TICKET_CTA=qa` — вместо них будет «Задать вопрос».

## База данных

Postgres (Prisma). Нужен `DATABASE_URL` в `.env.local`.
