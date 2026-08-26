import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TrainingService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  findAll() {
    return this.prisma.trainingSession.findMany({
      where: { deletedAt: null },
      orderBy: { savedAt: 'desc' },
      include: {
        player: true,
        shotType: true,
        reps: true,
      },
    });
  }

  findByPlayer(playerId: number) {
    return this.prisma.trainingSession.findMany({
      where: { playerId, deletedAt: null },
      include: {
        shotType: true,
        reps: true,
      },
    });
  }

  async create(data: any, authorization?: string) {
    const user = await this.authService.getOptionalUserFromAuthorization(authorization);
    const completedReps = Number(data.completedReps);
    const successfulReps = Number(data.successfulReps);
    const unsuccessfulReps = Number(data.unsuccessfulReps);
    const targetReps = Number(data.targetReps);
    const accuracy = completedReps ? Math.round((successfulReps / completedReps) * 100) : 0;

    if (targetReps <= 0) throw new BadRequestException('Target reps must be positive.');
    if (completedReps !== successfulReps + unsuccessfulReps) {
      throw new BadRequestException('Completed reps must equal successful plus unsuccessful reps.');
    }
    if (accuracy < 0 || accuracy > 100) throw new BadRequestException('Accuracy must be 0-100.');

    const shotType = data.shot
      ? await this.prisma.shotType.findUnique({ where: { name: data.shot } })
      : null;

    return this.prisma.trainingSession.create({
      data: {
        coachId: user?.role === 'coach' || user?.role === 'admin' ? user.id : null,
        playerId: Number(data.playerId),
        shotTypeId: shotType?.id,
        shot: data.shot,
        targetReps,
        completedReps,
        successfulReps,
        unsuccessfulReps,
        accuracy,
        durationMs: data.durationMs ? Number(data.durationMs) : null,
        startedAt: data.startedAt ? new Date(data.startedAt) : null,
        endedAt: data.endedAt ? new Date(data.endedAt) : null,
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

  remove(id: number) {
    return this.prisma.trainingSession.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
