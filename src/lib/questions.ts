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
}) {
  const rows = await prisma.question.findMany({
    where: {
      ...(options?.includeHidden ? {} : { status: { not: "hidden" } }),
      ...(options?.unansweredOnly ? { status: "open" } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapQuestion);
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
  return mapQuestion(row);
}
