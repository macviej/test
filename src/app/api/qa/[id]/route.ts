import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteQuestion,
  publicQuestion,
  updateQuestionStatus,
} from "@/lib/questions";
import { applyVisitorCookie, getViewerIdentity } from "@/lib/visitor";
import type { QuestionStatus } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: QuestionStatus };
  if (!body.status || !["open", "answered", "hidden"].includes(body.status)) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }

  const question = await updateQuestionStatus(id, body.status);
  if (!question) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json({ question: publicQuestion(question) });
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const isAdmin = await isAdminAuthenticated();
  const identity = await getViewerIdentity(request);

  try {
    const question = await deleteQuestion(id, identity.aliases, isAdmin);
    if (!question) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    }
    const response = NextResponse.json({ ok: true });
    return applyVisitorCookie(response, identity);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Нельзя удалить" }, { status: 403 });
    }
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
