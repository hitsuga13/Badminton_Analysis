-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "hand" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "heightCm" INTEGER NOT NULL,
    "weightKg" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "form" INTEGER[],

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);
