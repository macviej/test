import { NextResponse } from "next/server";
import { getRegistrationStatus } from "@/lib/i18n";
import { createParticipant } from "@/lib/participants";
import type { LunchType, RegisterInput } from "@/lib/types";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    if (getRegistrationStatus() !== "open") {
      return NextResponse.json(
        { error: "Регистрация закрыта" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as Partial<RegisterInput>;

    const firstName = body.firstName?.trim() ?? "";
    const lastName = body.lastName?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const telegram = body.telegram?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const needsLunch =
      typeof body.needsLunch === "boolean" ? body.needsLunch : null;
    const lunchType: LunchType | null =
      body.lunchType === "standard" || body.lunchType === "vegan"
        ? body.lunchType
        : null;
    const hasAllergy =
      typeof body.hasAllergy === "boolean" ? body.hasAllergy : null;
    const allergyNote = body.allergyNote?.trim() ?? "";
    const consent = Boolean(body.consent);

    if (!firstName || !lastName || !phone || !email) {
      return NextResponse.json(
        { error: "Заполните обязательные поля" },
        { status: 400 },
      );
    }

    if (!isEmail(email)) {
      return NextResponse.json({ error: "Некорректный e-mail" }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Нужно согласие на обработку данных" },
        { status: 400 },
      );
    }

    if (needsLunch === true) {
      if (!lunchType) {
        return NextResponse.json(
          { error: "Выберите тип обеда" },
          { status: 400 },
        );
      }
      if (hasAllergy === null) {
        return NextResponse.json(
          { error: "Укажите, есть ли аллергия" },
          { status: 400 },
        );
      }
      if (hasAllergy && !allergyNote) {
        return NextResponse.json(
          { error: "Укажите, на что аллергия" },
          { status: 400 },
        );
      }
    }

    const participant = await createParticipant({
      firstName,
      lastName,
      phone,
      telegram,
      email,
      needsLunch,
      lunchType,
      hasAllergy,
      allergyNote,
      consent,
    });

    return NextResponse.json({ participant });
  } catch {
    return NextResponse.json(
      { error: "Не удалось сохранить регистрацию" },
      { status: 500 },
    );
  }
}
