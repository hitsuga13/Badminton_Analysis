import { PrismaService } from '../prisma/prisma.service';
export declare class TrainingService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        player: {
            name: string;
            category: string;
            hand: string;
            age: number;
            heightCm: number;
            weightKg: number;
            rank: number;
            form: number[];
            id: number;
        };
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
    })[]>;
    findByPlayer(playerId: number): import("@prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    create(data: any): import("@prisma/client").Prisma.Prisma__TrainingSessionClient<{
        player: {
            name: string;
            category: string;
            hand: string;
            age: number;
            heightCm: number;
            weightKg: number;
            rank: number;
            form: number[];
            id: number;
        };
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
