import 'dotenv/config';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);

const shotCategory = {
  Smash: 'attack',
  Drive: 'attack',
  Drop: 'neutral',
  Lift: 'defense',
  Block: 'defense',
  Netting: 'neutral',
  'Net Shot': 'neutral',
  Serve: 'neutral',
};

async function main() {
  await clearDatabase();

  const coachUser = await prisma.user.create({
    data: {
      email: 'coach@akpshuttletrace.app',
      name: 'AKP Coach',
      role: 'coach',
      passwordHash: await hashPassword('password'),
      coachProfile: {
        create: {
          name: 'AKP Coach',
          phone: '+60123456789',
        },
      },
    },
    include: { coachProfile: true },
  });

  await prisma.shotType.createMany({
    data: [
      { name: 'Smash', category: 'attack' },
      { name: 'Drive', category: 'attack' },
      { name: 'Drop', category: 'neutral' },
      { name: 'Lift', category: 'defense' },
      { name: 'Block', category: 'defense' },
      { name: 'Netting', category: 'neutral' },
      { name: 'Net Shot', category: 'neutral' },
      { name: 'Serve', category: 'neutral' },
    ],
    skipDuplicates: true,
  });

  const napi = await prisma.player.create({
    data: {
      name: 'Napi',
      category: "Men's Singles",
      hand: 'Right',
      age: 23,
      heightCm: 178,
      weightKg: 72,
      rank: 1,
      form: [1, 1, 0, 1, 1],
      coachId: coachUser.coachProfile?.id,
    },
  });

  const lee = await prisma.player.create({
    data: {
      name: 'Lee Chong Siau',
      category: "Men's Singles",
      hand: 'Right',
      age: 24,
      heightCm: 182,
      weightKg: 76,
      rank: 2,
      form: [1, 0, 1, 1, 0],
      coachId: coachUser.coachProfile?.id,
    },
  });

  const aina = await prisma.player.create({
    data: {
      name: 'Aina Safiya',
      category: "Women's Singles",
      hand: 'Left',
      age: 21,
      heightCm: 168,
      weightKg: 58,
      rank: 3,
      form: [0, 1, 1, 1, 1],
      coachId: coachUser.coachProfile?.id,
    },
  });

  const match = await prisma.match.create({
    data: {
      player1Id: napi.id,
      player2Id: lee.id,
      player1Score: 21,
      player2Score: 18,
      date: new Date('2026-08-24T13:30:00.000Z'),
      status: 'ended',
      totalRallies: 3,
      totalShots: 14,
      matchFormat: 'Best of 3, first to 21',
      recordedByCoachId: coachUser.id,
      winnerId: napi.id,
      pointsToWin: 21,
      setsToWin: 2,
      startedAt: new Date('2026-08-24T13:30:00.000Z'),
      endedAt: new Date('2026-08-24T13:45:00.000Z'),
    },
  });

  await createRallyWithShots(match.id, 1, napi.id, [
    { playerId: napi.id, shot: 'Serve' },
    { playerId: lee.id, shot: 'Lift' },
    { playerId: napi.id, shot: 'Smash', result: 'Winner' },
  ]);

  await createRallyWithShots(match.id, 2, lee.id, [
    { playerId: lee.id, shot: 'Serve' },
    { playerId: napi.id, shot: 'Drop' },
    { playerId: lee.id, shot: 'Net Shot' },
    { playerId: napi.id, shot: 'Lift' },
    { playerId: lee.id, shot: 'Smash', result: 'Winner' },
  ]);

  await createRallyWithShots(match.id, 3, napi.id, [
    { playerId: napi.id, shot: 'Serve' },
    { playerId: lee.id, shot: 'Drive' },
    { playerId: napi.id, shot: 'Drive' },
    { playerId: lee.id, shot: 'Block' },
    { playerId: napi.id, shot: 'Netting' },
    { playerId: lee.id, shot: 'Lift' },
  ]);

  await createTrainingSession(
    coachUser.id,
    napi.id,
    'Smash',
    200,
    162,
    38,
    '2026-08-24T15:00:00.000Z',
  );
  await createTrainingSession(
    coachUser.id,
    napi.id,
    'Drop',
    200,
    148,
    52,
    '2026-08-24T16:00:00.000Z',
  );
  await createTrainingSession(
    coachUser.id,
    lee.id,
    'Drive',
    100,
    71,
    29,
    '2026-08-24T17:00:00.000Z',
  );
  await createTrainingSession(
    coachUser.id,
    aina.id,
    'Net Shot',
    100,
    84,
    16,
    '2026-08-24T18:00:00.000Z',
  );
}

async function clearDatabase() {
  await prisma.authSession.deleteMany();
  await prisma.shotRecord.deleteMany();
  await prisma.rally.deleteMany();
  await prisma.trainingRep.deleteMany();
  await prisma.trainingSession.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.user.deleteMany();
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function createRallyWithShots(
  matchId: number,
  rallyNumber: number,
  winnerId: number,
  shots: Array<{ playerId: number; shot: string; result?: string }>,
) {
  const startedAt = new Date(Date.UTC(2026, 7, 24, 13, 30, rallyNumber * 2));
  const endedAt = new Date(startedAt.getTime() + shots.length * 2400);

  const rally = await prisma.rally.create({
    data: {
      matchId,
      rallyNumber,
      winnerId,
      outcome: `Winner player ${winnerId}`,
      shots: shots.length,
      durationMs: endedAt.getTime() - startedAt.getTime(),
      startedAt,
      endedAt,
    },
  });

  await prisma.shotRecord.createMany({
    data: shots.map((shot, index) => ({
      matchId,
      rallyId: rally.id,
      playerId: shot.playerId,
      sequence: index + 1,
      shot: shot.shot,
      category: shotCategory[shot.shot] ?? 'neutral',
      result: shot.result ?? null,
      timestamp: new Date(startedAt.getTime() + index * 1200),
    })),
  });
}

async function createTrainingSession(
  coachId: number,
  playerId: number,
  shot: string,
  targetReps: number,
  successfulReps: number,
  unsuccessfulReps: number,
  savedAt: string,
) {
  const completedReps = successfulReps + unsuccessfulReps;
  const accuracy = Math.round((successfulReps / completedReps) * 100);

  await prisma.trainingSession.create({
    data: {
      coachId,
      playerId,
      shot,
      shotTypeId: (await prisma.shotType.findUnique({ where: { name: shot } }))
        ?.id,
      targetReps,
      completedReps,
      successfulReps,
      unsuccessfulReps,
      accuracy,
      durationMs: completedReps * 1400,
      startedAt: new Date(new Date(savedAt).getTime() - completedReps * 1400),
      endedAt: new Date(savedAt),
      savedAt: new Date(savedAt),
      reps: {
        create: Array.from(
          { length: Math.min(completedReps, 20) },
          (_, index) => ({
            repNumber: index + 1,
            successful:
              index <
              Math.round(Math.min(completedReps, 20) * (accuracy / 100)),
            recordedAt: new Date(new Date(savedAt).getTime() + index * 1400),
          }),
        ),
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    throw error;
  });
