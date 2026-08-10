import type { Participant as DbParticipant } from "@prisma/client";
import { prisma } from "./db";
import type { Participant, RegisterInput } from "./types";

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
    },
  });
  return mapParticipant(row);
}

export async function getParticipantByCode(
  code: string,
): Promise<Participant | null> {
  const normalized = code.trim().toUpperCase().replace(/^#/, "");
  const row = await prisma.participant.findUnique({
    where: { code: normalized },
  });
  return row ? mapParticipant(row) : null;
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
  const normalized = code.trim().toUpperCase().replace(/^#/, "");
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
