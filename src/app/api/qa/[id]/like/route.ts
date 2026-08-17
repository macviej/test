import { NextResponse } from "next/server";
import { publicQuestion, toggleLike } from "@/lib/questions";
import { applyVisitorCookie, getViewerIdentity } from "@/lib/visitor";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const identity = await getViewerIdentity(request);
  const question = await toggleLike(id, identity.aliases);

  if (!question) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const response = NextResponse.json({
    question: publicQuestion(question, identity.aliases),
  });
  return applyVisitorCookie(response, identity);
}
