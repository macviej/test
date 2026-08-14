import type { Participant as DbParticipant } from "@prisma/client";
import { prisma } from "./db";
import type { LunchType, Participant, RegisterInput } from "./types";
import { extractParticipantCode } from "./ticket-code";

function parseLunchType(value: string | null): LunchType | null {
  if (value === "standard" || value === "vegan") return value;
  return null;
}

function mapParticipant(row: DbParticipant): Participant {
  return {
    id: row.id,
    code: row.code,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    telegram: row.telegram,
    email: row.email,
    needsLunch: row.needsLunch,
    lunchType: parseLunchType(row.lunchType),
    hasAllergy: row.hasAllergy,
    allergyNote: row.allergyNote,
    checkedIn: row.checkedIn,
    checkedInAt: row.checkedInAt ? row.checkedInAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

async function nextCode() {
  const counter = await prisma.counter.upsert({
    where: { id: "participants" },
    create: { id: "participants", value: 1 },
    update: { value: { increment: 1 } },
  });
  return `IGC-2026-${String(counter.value).padStart(3, "0")}`;
}

export async function createParticipant(
  input: RegisterInput,
): Promise<Participant> {
  const code = await nextCode();
  const row = await prisma.participant.create({
    data: {
      code,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      telegram: input.telegram.trim().replace(/^@/, ""),
      email: input.email.trim().toLowerCase(),
      needsLunch: input.needsLunch,
      lunchType: input.needsLunch ? input.lunchType : null,
      hasAllergy: input.needsLunch ? input.hasAllergy : null,
      allergyNote:
        input.needsLunch && input.hasAllergy
          ? input.allergyNote.trim()
          : "",
    },
  });
  return mapParticipant(row);
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("80") && digits.length >= 11) {
    return `375${digits.slice(2)}`;
  }
  if (
    digits.length === 9 &&
    (digits.startsWith("29") ||
      digits.startsWith("25") ||
      digits.startsWith("33") ||
      digits.startsWith("44"))
  ) {
    return `375${digits}`;
  }
  return digits;
}

export async function getParticipantByCode(
  code: string,
): Promise<Participant | null> {
  const normalized =
    extractParticipantCode(code) ||
    code.trim().toUpperCase().replace(/^#/, "");
  const row = await prisma.participant.findUnique({
    where: { code: normalized },
  });
  return row ? mapParticipant(row) : null;
}

export async function findParticipantByPhoneAndLastName(
  phone: string,
  lastName: string,
): Promise<Participant | null> {
  const phoneDigits = normalizePhone(phone);
  const last = lastName.trim();
  if (!phoneDigits || !last) return null;

  const rows = await prisma.participant.findMany({
    where: {
      lastName: { equals: last, mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
  });

  const match = rows.find(
    (row) => normalizePhone(row.phone) === phoneDigits,
  );

  return match ? mapParticipant(match) : null;
}

export async function listParticipants(): Promise<Participant[]> {
  const rows = await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapParticipant);
}

export async function checkInParticipant(
  code: string,
): Promise<{ participant: Participant; alreadyCheckedIn: boolean } | null> {
  const normalized =
    extractParticipantCode(code) ||
    code.trim().toUpperCase().replace(/^#/, "");
  const current = await prisma.participant.findUnique({
    where: { code: normalized },
  });
  if (!current) return null;

  if (current.checkedIn) {
    return { participant: mapParticipant(current), alreadyCheckedIn: true };
  }

  const updated = await prisma.participant.update({
    where: { code: normalized },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
    },
  });

  return { participant: mapParticipant(updated), alreadyCheckedIn: false };
}
