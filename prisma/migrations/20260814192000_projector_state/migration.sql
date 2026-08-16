-- CreateTable
CREATE TABLE IF NOT EXISTS "ProjectorState" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "mode" TEXT NOT NULL DEFAULT 'list',
    "questionId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectorState_pkey" PRIMARY KEY ("id")
);
