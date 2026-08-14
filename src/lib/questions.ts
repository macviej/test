import type { Question as DbQuestion, QuestionStatus } from "@prisma/client";
import { prisma } from "./db";
import type { Question } from "./types";

function mapQuestion(row: DbQuestion): Question {
  return {
    id: row.id,
    text: row.text,
    authorKey: row.authorKey,
    authorLabel: row.authorLabel,
    likes: row.likes,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    answeredAt: row.answeredAt ? row.answeredAt.toISOString() : null,
  };
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
  popularFirst?: boolean;
}) {
  const rows = await prisma.question.findMany({
    where: {
      ...(options?.includeHidden ? {} : { status: { not: "hidden" } }),
      ...(options?.unansweredOnly ? { status: "open" } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  const mapped = rows.map(mapQuestion);
  if (!options?.popularFirst) return mapped;
  return [...mapped].sort(
    (a, b) =>
      b.likes.length - a.likes.length ||
      +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function createQuestion(input: {
  text: string;
  authorKey: string;
  authorLabel?: string;
}) {
  const text = input.text.trim();
  if (!text) throw new Error("EMPTY");
  if (text.length > 500) throw new Error("TOO_LONG");

  const row = await prisma.question.create({
    data: {
      text,
      authorKey: input.authorKey,
      authorLabel: input.authorLabel?.trim() || "Участник",
      likes: [],
      status: "open",
    },
  });
  return mapQuestion(row);
}

export async function toggleLike(id: string, viewerKey: string) {
  const current = await prisma.question.findUnique({ where: { id } });
  if (!current || current.status === "hidden") return null;

  const liked = current.likes.includes(viewerKey);
  const likes = liked
    ? current.likes.filter((k) => k !== viewerKey)
    : [...current.likes, viewerKey];

  const row = await prisma.question.update({
    where: { id },
    data: { likes },
  });
  return mapQuestion(row);
}

export type ProjectorMode = "idle" | "list" | "focus";

export async function getProjectorState() {
  return prisma.projectorState.upsert({
    where: { id: "default" },
    create: { id: "default", mode: "list", questionId: null },
    update: {},
  });
}

export async function setProjectorState(
  mode: ProjectorMode,
  questionId?: string | null,
) {
  const nextId = mode === "focus" ? (questionId ?? null) : null;
  return prisma.projectorState.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      mode,
      questionId: nextId,
    },
    update: {
      mode,
      questionId: nextId,
    },
  });
}

async function clearProjectorIfShowing(questionId: string) {
  const state = await prisma.projectorState.findUnique({
    where: { id: "default" },
  });
  if (state?.questionId === questionId) {
    await prisma.projectorState.update({
      where: { id: "default" },
      data: { mode: "list", questionId: null },
    });
  }
}

export async function updateQuestionStatus(id: string, status: QuestionStatus) {
  const current = await prisma.question.findUnique({ where: { id } });
  if (!current) return null;

  const row = await prisma.question.update({
    where: { id },
    data: {
      status,
      answeredAt: status === "answered" ? new Date() : current.answeredAt,
    },
  });

  if (status === "answered" || status === "hidden") {
    await clearProjectorIfShowing(id);
  }

  return mapQuestion(row);
}

export async function deleteQuestion(
  id: string,
  authorKey?: string,
  asAdmin = false,
) {
  const current = await prisma.question.findUnique({ where: { id } });
  if (!current) return null;
  if (!asAdmin && current.authorKey !== authorKey) {
    throw new Error("FORBIDDEN");
  }

  const row = await prisma.question.update({
    where: { id },
    data: { status: "hidden" },
  });
  await clearProjectorIfShowing(id);
  return mapQuestion(row);
}
