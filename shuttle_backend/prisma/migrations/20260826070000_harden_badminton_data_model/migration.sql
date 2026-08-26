-- CreateTable
CREATE TABLE "CoachProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShotType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShotType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchSet" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "player1Score" INTEGER NOT NULL DEFAULT 0,
    "player2Score" INTEGER NOT NULL DEFAULT 0,
    "winnerId" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchSet_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Player" ADD COLUMN "coachId" INTEGER;
ALTER TABLE "Player" ADD COLUMN "userId" INTEGER;
ALTER TABLE "Player" ADD COLUMN "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "Player" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Player" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Player" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Match" ADD COLUMN "recordedByCoachId" INTEGER;
ALTER TABLE "Match" ADD COLUMN "winnerId" INTEGER;
ALTER TABLE "Match" ADD COLUMN "pointsToWin" INTEGER;
ALTER TABLE "Match" ADD COLUMN "setsToWin" INTEGER;
ALTER TABLE "Match" ADD COLUMN "startedAt" TIMESTAMP(3);
ALTER TABLE "Match" ADD COLUMN "endedAt" TIMESTAMP(3);
ALTER TABLE "Match" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Match" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Match" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Rally" ADD COLUMN "outcomeType" TEXT;
ALTER TABLE "Rally" ADD COLUMN "outcomeReason" TEXT;
ALTER TABLE "Rally" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Rally" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ShotRecord" ADD COLUMN "shotTypeId" INTEGER;
ALTER TABLE "ShotRecord" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TrainingSession" ADD COLUMN "coachId" INTEGER;
ALTER TABLE "TrainingSession" ADD COLUMN "shotTypeId" INTEGER;
ALTER TABLE "TrainingSession" ADD COLUMN "startedAt" TIMESTAMP(3);
ALTER TABLE "TrainingSession" ADD COLUMN "endedAt" TIMESTAMP(3);
ALTER TABLE "TrainingSession" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "TrainingSession" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "TrainingSession" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_userId_key" ON "CoachProfile"("userId");
CREATE UNIQUE INDEX "ShotType_name_key" ON "ShotType"("name");
CREATE UNIQUE INDEX "Player_userId_key" ON "Player"("userId");
CREATE UNIQUE INDEX "MatchSet_matchId_setNumber_key" ON "MatchSet"("matchId", "setNumber");
CREATE UNIQUE INDEX "Rally_matchId_rallyNumber_key" ON "Rally"("matchId", "rallyNumber");
CREATE UNIQUE INDEX "ShotRecord_rallyId_sequence_key" ON "ShotRecord"("rallyId", "sequence");
CREATE UNIQUE INDEX "TrainingRep_trainingSessionId_repNumber_key" ON "TrainingRep"("trainingSessionId", "repNumber");

CREATE INDEX "Player_coachId_idx" ON "Player"("coachId");
CREATE INDEX "Player_category_idx" ON "Player"("category");
CREATE INDEX "Match_recordedByCoachId_idx" ON "Match"("recordedByCoachId");
CREATE INDEX "Match_player1Id_idx" ON "Match"("player1Id");
CREATE INDEX "Match_player2Id_idx" ON "Match"("player2Id");
CREATE INDEX "Match_winnerId_idx" ON "Match"("winnerId");
CREATE INDEX "Match_date_idx" ON "Match"("date");
CREATE INDEX "MatchSet_winnerId_idx" ON "MatchSet"("winnerId");
CREATE INDEX "Rally_winnerId_idx" ON "Rally"("winnerId");
CREATE INDEX "ShotRecord_matchId_idx" ON "ShotRecord"("matchId");
CREATE INDEX "ShotRecord_playerId_idx" ON "ShotRecord"("playerId");
CREATE INDEX "ShotRecord_shotTypeId_idx" ON "ShotRecord"("shotTypeId");
CREATE INDEX "TrainingSession_coachId_idx" ON "TrainingSession"("coachId");
CREATE INDEX "TrainingSession_playerId_idx" ON "TrainingSession"("playerId");
CREATE INDEX "TrainingSession_shotTypeId_idx" ON "TrainingSession"("shotTypeId");
CREATE INDEX "TrainingSession_savedAt_idx" ON "TrainingSession"("savedAt");

-- AddForeignKey
ALTER TABLE "CoachProfile" ADD CONSTRAINT "CoachProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Player" ADD CONSTRAINT "Player_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_recordedByCoachId_fkey" FOREIGN KEY ("recordedByCoachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MatchSet" ADD CONSTRAINT "MatchSet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchSet" ADD CONSTRAINT "MatchSet_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShotRecord" ADD CONSTRAINT "ShotRecord_shotTypeId_fkey" FOREIGN KEY ("shotTypeId") REFERENCES "ShotType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_shotTypeId_fkey" FOREIGN KEY ("shotTypeId") REFERENCES "ShotType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Domain checks. NOT VALID avoids breaking an old database immediately, while new writes are still checked.
ALTER TABLE "User" ADD CONSTRAINT "User_role_check" CHECK ("role" IN ('admin', 'coach', 'player')) NOT VALID;
ALTER TABLE "Player" ADD CONSTRAINT "Player_age_positive_check" CHECK ("age" > 0) NOT VALID;
ALTER TABLE "Player" ADD CONSTRAINT "Player_height_positive_check" CHECK ("heightCm" > 0) NOT VALID;
ALTER TABLE "Player" ADD CONSTRAINT "Player_weight_positive_check" CHECK ("weightKg" > 0) NOT VALID;
ALTER TABLE "Player" ADD CONSTRAINT "Player_rank_nonnegative_check" CHECK ("rank" >= 0) NOT VALID;
ALTER TABLE "Player" ADD CONSTRAINT "Player_hand_check" CHECK ("hand" IN ('Right', 'Left', 'Ambidextrous')) NOT VALID;
ALTER TABLE "Match" ADD CONSTRAINT "Match_distinct_players_check" CHECK ("player1Id" <> "player2Id") NOT VALID;
ALTER TABLE "Match" ADD CONSTRAINT "Match_scores_nonnegative_check" CHECK ("player1Score" >= 0 AND "player2Score" >= 0) NOT VALID;
ALTER TABLE "Match" ADD CONSTRAINT "Match_totals_nonnegative_check" CHECK ("totalRallies" >= 0 AND "totalShots" >= 0) NOT VALID;
ALTER TABLE "Match" ADD CONSTRAINT "Match_status_check" CHECK ("status" IN ('setup', 'coin-flip', 'live', 'ended', 'training', 'cancelled')) NOT VALID;
ALTER TABLE "Match" ADD CONSTRAINT "Match_points_sets_positive_check" CHECK (("pointsToWin" IS NULL OR "pointsToWin" > 0) AND ("setsToWin" IS NULL OR "setsToWin" > 0)) NOT VALID;
ALTER TABLE "MatchSet" ADD CONSTRAINT "MatchSet_positive_set_number_check" CHECK ("setNumber" > 0) NOT VALID;
ALTER TABLE "MatchSet" ADD CONSTRAINT "MatchSet_scores_nonnegative_check" CHECK ("player1Score" >= 0 AND "player2Score" >= 0) NOT VALID;
ALTER TABLE "Rally" ADD CONSTRAINT "Rally_positive_rally_number_check" CHECK ("rallyNumber" > 0) NOT VALID;
ALTER TABLE "Rally" ADD CONSTRAINT "Rally_shots_nonnegative_check" CHECK ("shots" >= 0) NOT VALID;
ALTER TABLE "Rally" ADD CONSTRAINT "Rally_duration_nonnegative_check" CHECK ("durationMs" IS NULL OR "durationMs" >= 0) NOT VALID;
ALTER TABLE "ShotRecord" ADD CONSTRAINT "ShotRecord_positive_sequence_check" CHECK ("sequence" > 0) NOT VALID;
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_reps_check" CHECK ("targetReps" > 0 AND "completedReps" >= 0 AND "successfulReps" >= 0 AND "unsuccessfulReps" >= 0 AND "completedReps" = "successfulReps" + "unsuccessfulReps") NOT VALID;
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_accuracy_check" CHECK ("accuracy" BETWEEN 0 AND 100) NOT VALID;
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_duration_nonnegative_check" CHECK ("durationMs" IS NULL OR "durationMs" >= 0) NOT VALID;
ALTER TABLE "TrainingRep" ADD CONSTRAINT "TrainingRep_positive_rep_number_check" CHECK ("repNumber" > 0) NOT VALID;
