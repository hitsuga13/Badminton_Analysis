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
    const coachProfile = await this.getCoachProfile(authorization);
    return this.prisma.player.findMany({
      where: coachProfile ? { coachId: coachProfile.id } : undefined,
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
    const coachProfile = await this.getCoachProfile(authorization);
    return this.prisma.player.create({
      data: {
        ...data,
        rank: 0, // sementara, boleh calculate proper ranking later
        coachId: coachProfile?.id,
      },
    });
  }

  update(
    id: number,
    data: Partial<{
      name: string;
      category: string;
      hand: string;
      age: number;
      heightCm: number;
      weightKg: number;
    }>,
  ) {
    return this.prisma.player.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
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

  findOne(id: number) {
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
}
