import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getProjectorState,
  setProjectorState,
  type ProjectorMode,
} from "@/lib/questions";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const state = await getProjectorState();
  return NextResponse.json({
    mode: state.mode,
    questionId: state.questionId,
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    mode?: ProjectorMode;
    questionId?: string | null;
  };

  const mode: ProjectorMode =
    body.mode === "idle" || body.mode === "list" || body.mode === "focus"
      ? body.mode
      : "list";

  if (mode === "focus") {
    const id = body.questionId?.trim();
    if (!id) {
      return NextResponse.json({ error: "Укажите вопрос" }, { status: 400 });
    }
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question || question.status === "hidden") {
      return NextResponse.json({ error: "Вопрос не найден" }, { status: 404 });
    }
    const state = await setProjectorState("focus", id);
    return NextResponse.json({
      mode: state.mode,
      questionId: state.questionId,
    });
  }

  const state = await setProjectorState(mode, null);
  return NextResponse.json({
    mode: state.mode,
    questionId: state.questionId,
  });
}
