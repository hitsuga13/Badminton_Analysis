import { PrismaService } from '../prisma/prisma.service';
export declare class PlayersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        trainingSessions: ({
            reps: {
                id: number;
                repNumber: number;
                successful: boolean;
                recordedAt: Date;
                trainingSessionId: number;
            }[];
        } & {
            id: number;
            durationMs: number | null;
            shot: string;
            targetReps: number;
            completedReps: number;
            successfulReps: number;
            unsuccessfulReps: number;
            accuracy: number;
            savedAt: Date;
            playerId: number;
        })[];
    } & {
        name: string;
        category: string;
        hand: string;
        age: number;
        heightCm: number;
        weightKg: number;
        rank: number;
        form: number[];
        id: number;
    })[]>;
    create(data: {
        name: string;
        category: string;
        hand: string;
        age: number;
        heightCm: number;
        weightKg: number;
        form: number[];
    }): import("@prisma/client").Prisma.Prisma__PlayerClient<{
        name: string;
        category: string;
        hand: string;
        age: number;
        heightCm: number;
        weightKg: number;
        rank: number;
        form: number[];
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, data: Partial<{
        name: string;
        category: string;
        hand: string;
        age: number;
        heightCm: number;
        weightKg: number;
    }>): import("@prisma/client").Prisma.Prisma__PlayerClient<{
        name: string;
        category: string;
        hand: string;
        age: number;
        heightCm: number;
        weightKg: number;
        rank: number;
        form: number[];
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__PlayerClient<{
        name: string;
        category: string;
        hand: string;
        age: number;
        heightCm: number;
        weightKg: number;
        rank: number;
        form: number[];
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__PlayerClient<({
        trainingSessions: ({
            reps: {
                id: number;
                repNumber: number;
                successful: boolean;
                recordedAt: Date;
                trainingSessionId: number;
            }[];
        } & {
            id: number;
            durationMs: number | null;
            shot: string;
            targetReps: number;
            completedReps: number;
            successfulReps: number;
            unsuccessfulReps: number;
            accuracy: number;
            savedAt: Date;
            playerId: number;
        })[];
    } & {
        name: string;
        category: string;
        hand: string;
        age: number;
        heightCm: number;
        weightKg: number;
        rank: number;
        form: number[];
        id: number;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
