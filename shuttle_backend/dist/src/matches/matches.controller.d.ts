import { MatchesService } from './matches.service';
export declare class MatchesController {
    private readonly matchesService;
    constructor(matchesService: MatchesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        shotRecords: {
            category: string | null;
            id: number;
            result: string | null;
            matchId: number;
            shot: string;
            playerId: number;
            sequence: number;
            timestamp: Date;
            rallyId: number | null;
        }[];
        player1: {
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
        player2: {
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
        rallies: {
            id: number;
            rallyNumber: number;
            outcome: string;
            shots: number;
            durationMs: number | null;
            startedAt: Date | null;
            endedAt: Date | null;
            matchId: number;
            winnerId: number | null;
        }[];
    } & {
        id: number;
        player1Score: number;
        player2Score: number;
        date: Date;
        status: string;
        totalRallies: number;
        totalShots: number;
        matchFormat: string | null;
        player1Id: number;
        player2Id: number;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__MatchClient<({
        shotRecords: {
            category: string | null;
            id: number;
            result: string | null;
            matchId: number;
            shot: string;
            playerId: number;
            sequence: number;
            timestamp: Date;
            rallyId: number | null;
        }[];
        player1: {
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
        player2: {
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
        rallies: {
            id: number;
            rallyNumber: number;
            outcome: string;
            shots: number;
            durationMs: number | null;
            startedAt: Date | null;
            endedAt: Date | null;
            matchId: number;
            winnerId: number | null;
        }[];
    } & {
        id: number;
        player1Score: number;
        player2Score: number;
        date: Date;
        status: string;
        totalRallies: number;
        totalShots: number;
        matchFormat: string | null;
        player1Id: number;
        player2Id: number;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    create(body: any): import("@prisma/client").Prisma.Prisma__MatchClient<{
        id: number;
        player1Score: number;
        player2Score: number;
        date: Date;
        status: string;
        totalRallies: number;
        totalShots: number;
        matchFormat: string | null;
        player1Id: number;
        player2Id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    createRally(id: string, body: any): import("@prisma/client").Prisma.Prisma__RallyClient<{
        id: number;
        rallyNumber: number;
        outcome: string;
        shots: number;
        durationMs: number | null;
        startedAt: Date | null;
        endedAt: Date | null;
        matchId: number;
        winnerId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    createShot(id: string, body: any): import("@prisma/client").Prisma.Prisma__ShotRecordClient<{
        category: string | null;
        id: number;
        result: string | null;
        matchId: number;
        shot: string;
        playerId: number;
        sequence: number;
        timestamp: Date;
        rallyId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
