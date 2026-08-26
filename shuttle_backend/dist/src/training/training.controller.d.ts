import { TrainingService } from './training.service';
export declare class TrainingController {
    private readonly trainingService;
    constructor(trainingService: TrainingService);
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
    findByPlayer(playerId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    create(body: any): import("@prisma/client").Prisma.Prisma__TrainingSessionClient<{
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
