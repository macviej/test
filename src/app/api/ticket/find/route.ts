import { NextResponse } from "next/server";
import { findParticipantByPhoneAndLastName } from "@/lib/participants";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: string;
      lastName?: string;
    };

    const phone = body.phone?.trim() || "";
    const lastName = body.lastName?.trim() || "";

    if (!phone || !lastName) {
      return NextResponse.json(
        { error: "Укажите фамилию и телефон" },
        { status: 400 },
      );
    }

    const participant = await findParticipantByPhoneAndLastName(
      phone,
      lastName,
    );

    if (!participant) {
      return NextResponse.json(
        { error: "Регистрация не найдена. Проверьте фамилию и телефон." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      participant: {
        code: participant.code,
        firstName: participant.firstName,
        lastName: participant.lastName,
      },
    });
  } catch {
    return NextResponse.json({ error: "Ошибка поиска" }, { status: 500 });
  }
}
