"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
    await createTrainingSession(napi.id, 'Smash', 200, 162, 38, '2026-08-24T15:00:00.000Z');
    await createTrainingSession(napi.id, 'Drop', 200, 148, 52, '2026-08-24T16:00:00.000Z');
    await createTrainingSession(lee.id, 'Drive', 100, 71, 29, '2026-08-24T17:00:00.000Z');
    await createTrainingSession(aina.id, 'Net Shot', 100, 84, 16, '2026-08-24T18:00:00.000Z');
}
async function clearDatabase() {
    await prisma.shotRecord.deleteMany();
    await prisma.rally.deleteMany();
    await prisma.trainingRep.deleteMany();
    await prisma.trainingSession.deleteMany();
    await prisma.match.deleteMany();
    await prisma.player.deleteMany();
}
async function createRallyWithShots(matchId, rallyNumber, winnerId, shots) {
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
async function createTrainingSession(playerId, shot, targetReps, successfulReps, unsuccessfulReps, savedAt) {
    const completedReps = successfulReps + unsuccessfulReps;
    const accuracy = Math.round((successfulReps / completedReps) * 100);
    await prisma.trainingSession.create({
        data: {
            playerId,
            shot,
            targetReps,
            completedReps,
            successfulReps,
            unsuccessfulReps,
            accuracy,
            durationMs: completedReps * 1400,
            savedAt: new Date(savedAt),
            reps: {
                create: Array.from({ length: Math.min(completedReps, 20) }, (_, index) => ({
                    repNumber: index + 1,
                    successful: index <
                        Math.round(Math.min(completedReps, 20) * (accuracy / 100)),
                    recordedAt: new Date(new Date(savedAt).getTime() + index * 1400),
                })),
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
//# sourceMappingURL=seed.js.map