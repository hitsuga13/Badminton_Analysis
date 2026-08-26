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
exports.TrainingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TrainingService = class TrainingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.trainingSession.findMany({
            include: {
                player: true,
                reps: true,
            },
        });
    }
    findByPlayer(playerId) {
        return this.prisma.trainingSession.findMany({
            where: { playerId },
            include: {
                reps: true,
            },
        });
    }
    create(data) {
        return this.prisma.trainingSession.create({
            data: {
                playerId: Number(data.playerId),
                shot: data.shot,
                targetReps: Number(data.targetReps),
                completedReps: Number(data.completedReps),
                successfulReps: Number(data.successfulReps),
                unsuccessfulReps: Number(data.unsuccessfulReps),
                accuracy: Number(data.accuracy),
                durationMs: data.durationMs ? Number(data.durationMs) : null,
                savedAt: data.savedAt ? new Date(data.savedAt) : new Date(),
                reps: {
                    create: (data.reps ?? []).map((rep) => ({
                        repNumber: Number(rep.repNumber),
                        successful: Boolean(rep.successful),
                        recordedAt: rep.recordedAt ? new Date(rep.recordedAt) : new Date(),
                    })),
                },
            },
            include: {
                player: true,
                reps: true,
            },
        });
    }
};
exports.TrainingService = TrainingService;
exports.TrainingService = TrainingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainingService);
//# sourceMappingURL=training.service.js.map