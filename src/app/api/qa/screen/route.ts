import { NextResponse } from "next/server";
import {
  getProjectorState,
  listQuestions,
  publicQuestion,
} from "@/lib/questions";
import { buildQrDataUrl } from "@/lib/qr";
import { prisma } from "@/lib/db";

function askUrlFromRequest(request: Request) {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "imagodeiconf.vercel.app";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}/qa`;
}

export async function GET(request: Request) {
  const state = await getProjectorState();
  const questions = await listQuestions({
    includeHidden: false,
    unansweredOnly: true,
    popularFirst: true,
  });

  let featured = null;
  if (state.mode === "focus" && state.questionId) {
    const row = await prisma.question.findUnique({
      where: { id: state.questionId },
    });
    if (row && row.status === "open") {
      featured = publicQuestion({
        ...row,
        createdAt: row.createdAt.toISOString(),
        answeredAt: row.answeredAt ? row.answeredAt.toISOString() : null,
      });
    }
  }

  const askUrl = askUrlFromRequest(request);
  const qrDataUrl = await buildQrDataUrl(askUrl);

  return NextResponse.json({
    mode: featured ? "focus" : state.mode === "idle" ? "idle" : "list",
    featured,
    questions: questions.map((q) => publicQuestion(q)),
    qrDataUrl,
    askUrl,
  });
}
