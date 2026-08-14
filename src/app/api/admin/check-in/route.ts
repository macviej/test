import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { checkInParticipant } from "@/lib/participants";
import { extractParticipantCode } from "@/lib/ticket-code";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { code?: string };
    const code = extractParticipantCode(body.code || "") || body.code?.trim() || "";
    if (!code) {
      return NextResponse.json({ error: "Укажите код" }, { status: 400 });
    }

    const result = await checkInParticipant(code);
    if (!result) {
      return NextResponse.json({ error: "Участник не найден" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Ошибка check-in" }, { status: 500 });
  }
}
