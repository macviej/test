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
- Админка: http://localhost:3002/admin/login (`admin` / `admin`)

## Прод (Vercel)

Сейчас: https://workspace-five-delta-57.vercel.app

Красивый бесплатный URL: переименовать проект в Vercel в **`imagodeiconf`**  
→ https://imagodeiconf.vercel.app  

Settings → General → Project Name → `imagodeiconf` → Save  
(https://vercel.com/eloqwnt1/workspace/settings)

## База данных

Postgres (Prisma). Нужен `DATABASE_URL` в `.env.local`.
