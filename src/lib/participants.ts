import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { Participant, RegisterInput } from "./types";

type Store = {
  participants: Participant[];
  counter: number;
};

const globalStore = globalThis as unknown as {
  __imagoStore?: Store;
};

function getMemoryStore(): Store {
  if (!globalStore.__imagoStore) {
    globalStore.__imagoStore = { participants: [], counter: 0 };
  }
  return globalStore.__imagoStore;
}

function dataPath() {
  return path.join(process.cwd(), "data", "participants.json");
}

function normalizeParticipant(
  raw: Partial<Participant> & {
    id?: string;
    code?: string;
    createdAt?: string;
  },
): Participant {
  return {
    id: raw.id || randomBytes(8).toString("hex"),
    code: raw.code || "IGC-2026-000",
    firstName: raw.firstName || "",
    lastName: raw.lastName || "",
    phone: raw.phone || "",
    telegram: raw.telegram || "",
    email: raw.email || "",
    needsLunch: raw.needsLunch ?? null,
    checkedIn: Boolean(raw.checkedIn),
    checkedInAt: raw.checkedInAt ?? null,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

async function readStore(): Promise<Store> {
  const memory = getMemoryStore();
  try {
    const raw = await fs.readFile(dataPath(), "utf8");
    const parsed = JSON.parse(raw) as Store;
    memory.participants = (parsed.participants ?? []).map((p) =>
      normalizeParticipant(p as Participant),
    );
    memory.counter = parsed.counter ?? memory.participants.length;
    return memory;
  } catch {
    return memory;
  }
}

async function writeStore(store: Store) {
  getMemoryStore().participants = store.participants;
  getMemoryStore().counter = store.counter;
  try {
    await fs.mkdir(path.dirname(dataPath()), { recursive: true });
    await fs.writeFile(dataPath(), JSON.stringify(store, null, 2), "utf8");
  } catch {
    // File writes may fail on serverless — memory store still works for the instance.
  }
}

function nextCode(counter: number) {
  return `IGC-2026-${String(counter).padStart(3, "0")}`;
}

export async function createParticipant(
  input: RegisterInput,
): Promise<Participant> {
  const store = await readStore();
  const counter = store.counter + 1;
  const participant: Participant = {
    id: randomBytes(8).toString("hex"),
    code: nextCode(counter),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: input.phone.trim(),
    telegram: input.telegram.trim().replace(/^@/, ""),
    email: input.email.trim().toLowerCase(),
    needsLunch: input.needsLunch,
    checkedIn: false,
    checkedInAt: null,
    createdAt: new Date().toISOString(),
  };

  store.counter = counter;
  store.participants.push(participant);
  await writeStore(store);
  return participant;
}

export async function getParticipantByCode(
  code: string,
): Promise<Participant | null> {
  const store = await readStore();
  const normalized = code.trim().toUpperCase().replace(/^#/, "");
  return (
    store.participants.find((p) => p.code.toUpperCase() === normalized) ?? null
  );
}

export async function listParticipants(): Promise<Participant[]> {
  const store = await readStore();
  return [...store.participants].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function checkInParticipant(
  code: string,
): Promise<{ participant: Participant; alreadyCheckedIn: boolean } | null> {
  const store = await readStore();
  const normalized = code.trim().toUpperCase().replace(/^#/, "");
  const index = store.participants.findIndex(
    (p) => p.code.toUpperCase() === normalized,
  );
  if (index < 0) return null;

  const current = normalizeParticipant(store.participants[index]);
  if (current.checkedIn) {
    return { participant: current, alreadyCheckedIn: true };
  }

  const updated: Participant = {
    ...current,
    checkedIn: true,
    checkedInAt: new Date().toISOString(),
  };
  store.participants[index] = updated;
  await writeStore(store);
  return { participant: updated, alreadyCheckedIn: false };
}
