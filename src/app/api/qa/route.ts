import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createQuestion,
  listQuestions,
  publicQuestion,
} from "@/lib/questions";
import { applyVisitorCookie, getViewerIdentity } from "@/lib/visitor";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unansweredOnly = searchParams.get("unanswered") === "1";
  const isAdmin = await isAdminAuthenticated();
  const identity = await getViewerIdentity(request);

  const questions = await listQuestions({
    includeHidden: false,
    unansweredOnly: isAdmin && unansweredOnly,
  });

  const response = NextResponse.json({
    questions: questions.map((q) => publicQuestion(q, identity.aliases)),
  });
  return applyVisitorCookie(response, identity);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      authorLabel?: string;
    };
    const identity = await getViewerIdentity(request);
    const question = await createQuestion({
      text: body.text || "",
      authorKey: identity.key,
      authorLabel: body.authorLabel,
    });

    const response = NextResponse.json({
      question: publicQuestion(question, identity.aliases),
    });
    return applyVisitorCookie(response, identity);
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
