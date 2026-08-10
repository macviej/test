import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createQuestion,
  listQuestions,
  publicQuestion,
} from "@/lib/questions";
import {
  getOrCreateVisitorKey,
  visitorCookieOptions,
} from "@/lib/visitor";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unansweredOnly = searchParams.get("unanswered") === "1";
  const isAdmin = await isAdminAuthenticated();
  const { key, setCookie } = await getOrCreateVisitorKey();

  const questions = await listQuestions({
    includeHidden: false,
    unansweredOnly: isAdmin && unansweredOnly,
  });

  const response = NextResponse.json({
    questions: questions.map((q) => publicQuestion(q, key)),
  });

  if (setCookie) {
    const opts = visitorCookieOptions(key);
    response.cookies.set(opts.name, opts.value, opts);
  }

  return response;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      authorLabel?: string;
    };
    const { key, setCookie } = await getOrCreateVisitorKey();
    const question = await createQuestion({
      text: body.text || "",
      authorKey: key,
      authorLabel: body.authorLabel,
    });

    const response = NextResponse.json({
      question: publicQuestion(question, key),
    });
    if (setCookie) {
      const opts = visitorCookieOptions(key);
      response.cookies.set(opts.name, opts.value, opts);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "ERROR";
    if (message === "EMPTY") {
      return NextResponse.json({ error: "Введите вопрос" }, { status: 400 });
    }
    if (message === "TOO_LONG") {
      return NextResponse.json({ error: "Слишком длинный вопрос" }, { status: 400 });
    }
    return NextResponse.json({ error: "Не удалось сохранить" }, { status: 500 });
  }
}
