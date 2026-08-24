-- AlterTable
ALTER TABLE "Match" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ended';
ALTER TABLE "Match" ADD COLUMN "totalRallies" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Match" ADD COLUMN "totalShots" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Match" ADD COLUMN "matchFormat" TEXT;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Rally" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "rallyNumber" INTEGER NOT NULL,
    "winnerId" INTEGER,
    "outcome" TEXT NOT NULL,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Rally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShotRecord" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "rallyId" INTEGER,
    "playerId" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "shot" TEXT NOT NULL,
    "category" TEXT,
    "result" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShotRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "shot" TEXT NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "completedReps" INTEGER NOT NULL,
    "successfulReps" INTEGER NOT NULL,
    "unsuccessfulReps" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "durationMs" INTEGER,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRep" (
    "id" SERIAL NOT NULL,
    "trainingSessionId" INTEGER NOT NULL,
    "repNumber" INTEGER NOT NULL,
    "successful" BOOLEAN NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingRep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rally" ADD CONSTRAINT "Rally_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rally" ADD CONSTRAINT "Rally_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShotRecord" ADD CONSTRAINT "ShotRecord_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShotRecord" ADD CONSTRAINT "ShotRecord_rallyId_fkey" FOREIGN KEY ("rallyId") REFERENCES "Rally"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShotRecord" ADD CONSTRAINT "ShotRecord_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingRep" ADD CONSTRAINT "TrainingRep_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
