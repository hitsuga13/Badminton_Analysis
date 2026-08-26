import { PlayersService } from './players.service';
export declare class PlayersController {
    private readonly playersService;
    constructor(playersService: PlayersService);
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
    findOne(id: string): import("@prisma/client").Prisma.Prisma__PlayerClient<({
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
    create(body: any): import("@prisma/client").Prisma.Prisma__PlayerClient<{
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
    update(id: string, body: any): import("@prisma/client").Prisma.Prisma__PlayerClient<{
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
    remove(id: string): {
        deleted: boolean;
    };
}
