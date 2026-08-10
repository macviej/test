import { NextResponse } from "next/server";
import { getParticipantByCode } from "@/lib/participants";
import { buildQrDataUrl } from "@/lib/qr";

type Params = { params: Promise<{ code: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { code } = await params;
  const participant = await getParticipantByCode(code);

  if (!participant) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const qrDataUrl = await buildQrDataUrl(participant.code);

  return NextResponse.json({ participant, qrDataUrl });
}
