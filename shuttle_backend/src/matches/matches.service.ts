/*
https://docs.nestjs.com/providers#services
*/
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prismaService: PrismaService) {}

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

  create(data: any) {
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

  findOne(id: number) {
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

  createRally(matchId: number, data: any) {
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

  createShot(matchId: number, data: any) {
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

  getMatches(): string {
    return 'Match Result';
  }
}
