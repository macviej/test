-- CreateTable
CREATE TABLE "ProjectorState" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "mode" TEXT NOT NULL DEFAULT 'list',
    "questionId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectorState_pkey" PRIMARY KEY ("id")
);
