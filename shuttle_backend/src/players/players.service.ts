import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class PlayersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async findAll(authorization?: string) {
    const user = await this.authService.getOptionalUserFromAuthorization(authorization);
    const coachProfile = await this.getCoachProfileForUser(user);
    const where = coachProfile
      ? { coachId: coachProfile.id, deletedAt: null }
      : user?.role === 'player'
        ? { userId: user.id, deletedAt: null }
        : { deletedAt: null };

    return this.prisma.player.findMany({
      where,
      include: {
        trainingSessions: {
          include: {
            reps: true,
          },
        },
      },
    });
  }

  async create(data: {
    name: string;
    category: string;
    hand: string;
    age: number;
    heightCm: number;
    weightKg: number;
    form: number[];
  }, authorization?: string) {
    const user = await this.authService.getOptionalUserFromAuthorization(authorization);
    const coachProfile = await this.getCoachProfileForUser(user);
    return this.prisma.player.create({
      data: {
        ...data,
        rank: 0, // sementara, boleh calculate proper ranking later
        coachId: coachProfile?.id,
      },
    });
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      category: string;
      hand: string;
      age: number;
      heightCm: number;
      weightKg: number;
    }>,
    authorization?: string,
  ) {
    await this.assertPlayerAccess(id, authorization);
    return this.prisma.player.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, authorization?: string) {
    await this.assertPlayerAccess(id, authorization);
    return this.prisma.$transaction(async (tx) => {
      const relatedMatchCount = await tx.match.count({
        where: {
          OR: [{ player1Id: id }, { player2Id: id }],
        },
      });
      const relatedShotCount = await tx.shotRecord.count({ where: { playerId: id } });
      const relatedWinCount = await tx.rally.count({ where: { winnerId: id } });

      if (relatedMatchCount || relatedShotCount || relatedWinCount) {
        throw new BadRequestException(
          'Player has match history and cannot be deleted without removing related match data first.',
        );
      }

      return tx.player.delete({
        where: { id },
      });
    });
  }

  async findOne(id: number, authorization?: string) {
    await this.assertPlayerAccess(id, authorization);
    return this.prisma.player.findUnique({
      where: { id },
      include: {
        trainingSessions: {
          include: {
            reps: true,
          },
        },
      },
    });
  }

  private async getCoachProfile(authorization?: string) {
    const user = await this.authService.getOptionalUserFromAuthorization(authorization);
    return this.getCoachProfileForUser(user);
  }

  private async getCoachProfileForUser(user: Awaited<ReturnType<AuthService['getUserFromToken']>> | null) {
    if (!user || (user.role !== 'coach' && user.role !== 'admin')) return null;

    return this.prisma.coachProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        name: user.name,
      },
      update: {},
    });
  }

  private async assertPlayerAccess(id: number, authorization?: string) {
    const user = await this.authService.getOptionalUserFromAuthorization(authorization);
    if (!user) return;

    const coachProfile = await this.getCoachProfileForUser(user);
    const player = await this.prisma.player.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(coachProfile ? { coachId: coachProfile.id } : { userId: user.id }),
      },
      select: { id: true },
    });

    if (!player) throw new BadRequestException('Player is not available for this user.');
  }
}
