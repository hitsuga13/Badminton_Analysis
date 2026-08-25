import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.player.findMany({
      include: {
        trainingSessions: {
          include: {
            reps: true,
          },
        },
      },
    });
  }

  create(data: {
    name: string;
    category: string;
    hand: string;
    age: number;
    heightCm: number;
    weightKg: number;
    form: number[];
  }) {
    return this.prisma.player.create({
      data: {
        ...data,
        rank: 0, // sementara, boleh calculate proper ranking later
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
}
