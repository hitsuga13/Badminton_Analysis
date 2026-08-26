"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MatchesService = class MatchesService {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    findAll() {
        return this.prismaService.match.findMany({
            include: {
                player1: true,
                player2: true,
                rallies: true,
                shotRecords: true,
            },
        });
    }
    create(data) {
        return this.prismaService.match.create({
            data: {
                player1Id: Number(data.player1Id),
                player2Id: Number(data.player2Id),
                player1Score: Number(data.player1Score ?? 0),
                player2Score: Number(data.player2Score ?? 0),
                date: data.date ? new Date(data.date) : new Date(),
                status: data.status ?? 'ended',
                totalRallies: Number(data.totalRallies ?? 0),
                totalShots: Number(data.totalShots ?? 0),
                matchFormat: data.matchFormat,
            },
        });
    }
    findOne(id) {
        return this.prismaService.match.findUnique({
            where: { id },
            include: {
                player1: true,
                player2: true,
                rallies: true,
                shotRecords: true,
            },
        });
    }
    createRally(matchId, data) {
        return this.prismaService.rally.create({
            data: {
                matchId,
                rallyNumber: Number(data.rallyNumber),
                winnerId: data.winnerId ? Number(data.winnerId) : null,
                outcome: data.outcome,
                shots: Number(data.shots ?? 0),
                durationMs: data.durationMs ? Number(data.durationMs) : null,
                startedAt: data.startedAt ? new Date(data.startedAt) : null,
                endedAt: data.endedAt ? new Date(data.endedAt) : null,
            },
        });
    }
    createShot(matchId, data) {
        return this.prismaService.shotRecord.create({
            data: {
                matchId,
                rallyId: data.rallyId ? Number(data.rallyId) : null,
                playerId: Number(data.playerId),
                sequence: Number(data.sequence),
                shot: data.shot,
                category: data.category,
                result: data.result,
                timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            },
        });
    }
    getMatches() {
        return 'Match Result';
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchesService);
//# sourceMappingURL=matches.service.js.map