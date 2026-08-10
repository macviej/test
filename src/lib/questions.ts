import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { Question, QuestionStatus } from "./types";

type Store = {
  questions: Question[];
};

const globalStore = globalThis as unknown as {
  __imagoQuestions?: Store;
};

function getMemoryStore(): Store {
  if (!globalStore.__imagoQuestions) {
    globalStore.__imagoQuestions = { questions: [] };
  }
  return globalStore.__imagoQuestions;
}

function dataPath() {
  return path.join(process.cwd(), "data", "questions.json");
}

async function readStore(): Promise<Store> {
  const memory = getMemoryStore();
  try {
    const raw = await fs.readFile(dataPath(), "utf8");
    const parsed = JSON.parse(raw) as Store;
    memory.questions = parsed.questions ?? [];
    return memory;
  } catch {
    return memory;
  }
}

async function writeStore(store: Store) {
  getMemoryStore().questions = store.questions;
  try {
    await fs.mkdir(path.dirname(dataPath()), { recursive: true });
    await fs.writeFile(dataPath(), JSON.stringify(store, null, 2), "utf8");
  } catch {
    // ignore serverless write failures
  }
}

export function publicQuestion(q: Question, viewerKey?: string) {
  return {
    id: q.id,
    text: q.text,
    authorLabel: q.authorLabel,
    likeCount: q.likes.length,
    likedByMe: viewerKey ? q.likes.includes(viewerKey) : false,
    isMine: viewerKey ? q.authorKey === viewerKey : false,
    status: q.status,
    createdAt: q.createdAt,
    answeredAt: q.answeredAt,
  };
}

export async function listQuestions(options?: {
  includeHidden?: boolean;
  unansweredOnly?: boolean;
}) {
  const store = await readStore();
  let items = [...store.questions];
  if (!options?.includeHidden) {
    items = items.filter((q) => q.status !== "hidden");
  }
  if (options?.unansweredOnly) {
    items = items.filter((q) => q.status === "open");
  }
  return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function createQuestion(input: {
  text: string;
  authorKey: string;
  authorLabel?: string;
}) {
  const text = input.text.trim();
  if (!text) throw new Error("EMPTY");
  if (text.length > 500) throw new Error("TOO_LONG");

  const store = await readStore();
  const question: Question = {
    id: randomBytes(8).toString("hex"),
    text,
    authorKey: input.authorKey,
    authorLabel: input.authorLabel?.trim() || "Участник",
    likes: [],
    status: "open",
    createdAt: new Date().toISOString(),
    answeredAt: null,
  };
  store.questions.unshift(question);
  await writeStore(store);
  return question;
}

export async function toggleLike(id: string, viewerKey: string) {
  const store = await readStore();
  const index = store.questions.findIndex((q) => q.id === id);
  if (index < 0) return null;
  const question = store.questions[index];
  if (question.status === "hidden") return null;

  const liked = question.likes.includes(viewerKey);
  question.likes = liked
    ? question.likes.filter((k) => k !== viewerKey)
    : [...question.likes, viewerKey];
  store.questions[index] = question;
  await writeStore(store);
  return question;
}

export async function updateQuestionStatus(id: string, status: QuestionStatus) {
  const store = await readStore();
  const index = store.questions.findIndex((q) => q.id === id);
  if (index < 0) return null;
  const question = {
    ...store.questions[index],
    status,
    answeredAt:
      status === "answered" ? new Date().toISOString() : store.questions[index].answeredAt,
  };
  store.questions[index] = question;
  await writeStore(store);
  return question;
}

export async function deleteQuestion(id: string, authorKey?: string, asAdmin = false) {
  const store = await readStore();
  const index = store.questions.findIndex((q) => q.id === id);
  if (index < 0) return null;
  const question = store.questions[index];
  if (!asAdmin && question.authorKey !== authorKey) {
    throw new Error("FORBIDDEN");
  }
  question.status = "hidden";
  store.questions[index] = question;
  await writeStore(store);
  return question;
}
