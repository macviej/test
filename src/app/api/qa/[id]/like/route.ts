import { NextResponse } from "next/server";
import { publicQuestion, toggleLike } from "@/lib/questions";
import {
  getOrCreateVisitorKey,
  visitorCookieOptions,
} from "@/lib/visitor";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const { key, setCookie } = await getOrCreateVisitorKey();
  const question = await toggleLike(id, key);

  if (!question) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const response = NextResponse.json({
    question: publicQuestion(question, key),
  });
  if (setCookie) {
    const opts = visitorCookieOptions(key);
    response.cookies.set(opts.name, opts.value, opts);
  }
  return response;
}
