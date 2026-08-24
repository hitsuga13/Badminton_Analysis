import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.trainingSession.findMany({
      include: {
        player: true,
        reps: true,
      },
    });
  }

  findByPlayer(playerId: number) {
    return this.prisma.trainingSession.findMany({
      where: { playerId },
      include: {
        reps: true,
      },
    });
  }

  create(data: any) {
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
}
