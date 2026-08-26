/*
https://docs.nestjs.com/providers#services
*/
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

const allowedShotNames = new Set([
  'Smash',
  'Drive',
  'Drop',
  'Lift',
  'Netting',
  'Serve',
]);

@Injectable()
export class MatchesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async findAll(authorization?: string) {
    const user =
      await this.authService.getOptionalUserFromAuthorization(authorization);
    const where: any = { deletedAt: null };
    if (user?.role === 'coach' || user?.role === 'admin') {
      where.recordedByCoachId = user.id;
    }

    return this.prismaService.match.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        player1: true,
        player2: true,
        winner: true,
        sets: true,
        rallies: {
          include: {
            winner: true,
            shotRecords: {
              include: { player: true, shotType: true },
              orderBy: { sequence: 'asc' },
            },
          },
          orderBy: { rallyNumber: 'asc' },
        },
        shotRecords: true,
      },
    });
  }

  async create(data: any, authorization?: string) {
    const user =
      await this.authService.getOptionalUserFromAuthorization(authorization);
    const player1Id = Number(data.player1Id);
    const player2Id = Number(data.player2Id);
    if (player1Id === player2Id)
      throw new BadRequestException('A match needs two different players.');

    return this.prismaService.match.create({
      data: {
        recordedByCoachId:
          user?.role === 'coach' || user?.role === 'admin' ? user.id : null,
        player1Id,
        player2Id,
        player1Score: Number(data.player1Score ?? 0),
        player2Score: Number(data.player2Score ?? 0),
        winnerId: data.winnerId ? Number(data.winnerId) : null,
        date: data.date ? new Date(data.date) : new Date(),
        status: data.status ?? 'ended',
        totalRallies: Number(data.totalRallies ?? 0),
        totalShots: Number(data.totalShots ?? 0),
        matchFormat: data.matchFormat,
        pointsToWin: data.pointsToWin ? Number(data.pointsToWin) : null,
        setsToWin: data.setsToWin ? Number(data.setsToWin) : null,
        startedAt: data.startedAt ? new Date(data.startedAt) : null,
        endedAt: data.endedAt ? new Date(data.endedAt) : null,
      },
    });
  }

  async createReport(report: any, authorization?: string) {
    const user =
      await this.authService.getOptionalUserFromAuthorization(authorization);
    const matchData = report?.match;
    if (!matchData) throw new BadRequestException('Match report is required.');

    const player1Id = Number(matchData.playerAId);
    const player2Id = Number(matchData.playerBId);
    if (!player1Id || !player2Id)
      throw new BadRequestException('Both match players are required.');
    if (player1Id === player2Id)
      throw new BadRequestException('A match needs two different players.');

    const playerIds = new Set([player1Id, player2Id]);
    const winnerId = this.playerCodeToId(
      matchData.gamesA > matchData.gamesB ? 'A' : 'B',
      player1Id,
      player2Id,
    );
    const roundOutcomes = report.roundOutcomes ?? report.rallyOutcomes ?? [];
    const notation = report.notation ?? [];

    return this.prismaService.$transaction(async (tx) => {
      const players = await tx.player.findMany({
        where: { id: { in: [player1Id, player2Id] } },
        select: { id: true },
      });
      if (players.length !== 2)
        throw new BadRequestException('One or both players do not exist.');

      const match = await tx.match.create({
        data: {
          recordedByCoachId:
            user?.role === 'coach' || user?.role === 'admin' ? user.id : null,
          player1Id,
          player2Id,
          winnerId: playerIds.has(winnerId) ? winnerId : null,
          player1Score: Number(matchData.scoreA ?? 0),
          player2Score: Number(matchData.scoreB ?? 0),
          status: 'ended',
          totalRallies: Number(
            matchData.totalRounds ??
              report.rallyOutcomes?.length ??
              roundOutcomes.length ??
              0,
          ),
          totalShots: Number(matchData.totalShots ?? notation.length ?? 0),
          matchFormat: matchData.scoringFormat ?? matchData.matchFormat,
          pointsToWin: matchData.pointsToWin
            ? Number(matchData.pointsToWin)
            : null,
          setsToWin: matchData.setsToWin ? Number(matchData.setsToWin) : null,
          date: matchData.savedAt ? new Date(matchData.savedAt) : new Date(),
          startedAt: matchData.overallStartedAt
            ? new Date(matchData.overallStartedAt)
            : null,
          endedAt: matchData.savedAt ? new Date(matchData.savedAt) : new Date(),
        },
      });

      for (const set of report.setDurations ?? []) {
        const setWinnerId = this.playerCodeToId(
          Number(set.scoreA ?? 0) >= Number(set.scoreB ?? 0) ? 'A' : 'B',
          player1Id,
          player2Id,
        );
        await tx.matchSet.create({
          data: {
            matchId: match.id,
            setNumber: Number(set.setNumber),
            player1Score: Number(set.scoreA ?? 0),
            player2Score: Number(set.scoreB ?? 0),
            winnerId: playerIds.has(setWinnerId) ? setWinnerId : null,
            startedAt: set.startedAt ? new Date(set.startedAt) : null,
            endedAt: set.endedAt ? new Date(set.endedAt) : null,
          },
        });
      }

      for (const outcome of roundOutcomes) {
        const rallyNumber = Number(outcome.roundNumber ?? outcome.rallyNumber);
        const rallyShots = notation.filter(
          (shot) =>
            Number(shot.roundNumber ?? shot.rallyNumber) === rallyNumber &&
            allowedShotNames.has(shot.shot),
        );
        const winner = this.playerCodeToId(
          outcome.winner,
          player1Id,
          player2Id,
        );
        const rally = await tx.rally.create({
          data: {
            matchId: match.id,
            rallyNumber,
            winnerId: playerIds.has(winner) ? winner : null,
            outcome: outcome.outcome ?? 'Round ended',
            outcomeType: outcome.endingType ?? null,
            outcomeReason: outcome.endingReason ?? null,
            shots: rallyShots.length,
            durationMs: outcome.durationMs ? Number(outcome.durationMs) : null,
            startedAt: outcome.startedAt ? new Date(outcome.startedAt) : null,
            endedAt: outcome.endedAt ? new Date(outcome.endedAt) : null,
          },
        });

        for (const [index, shot] of rallyShots.entries()) {
          const playerId = this.playerCodeToId(
            shot.player,
            player1Id,
            player2Id,
          );
          if (!playerIds.has(playerId)) continue;
          const shotType = await tx.shotType.findUnique({
            where: { name: shot.shot },
          });
          await tx.shotRecord.create({
            data: {
              matchId: match.id,
              rallyId: rally.id,
              playerId,
              shotTypeId: shotType?.id,
              sequence: index + 1,
              shot: shot.shot,
              category: shotType?.category ?? shot.category ?? null,
              result: shot.result ?? null,
              timestamp: shot.timestamp ? new Date(shot.timestamp) : new Date(),
            },
          });
        }
      }

      return tx.match.findUnique({
        where: { id: match.id },
        include: {
          player1: true,
          player2: true,
          winner: true,
          sets: true,
          rallies: { include: { shotRecords: true } },
        },
      });
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
    if (!allowedShotNames.has(data.shot)) {
      throw new BadRequestException('Unsupported shot type.');
    }

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

  async remove(id: number, authorization?: string) {
    const user =
      await this.authService.getOptionalUserFromAuthorization(authorization);
    const where: any = { id };
    if (user?.role === 'coach' || user?.role === 'admin') {
      where.recordedByCoachId = user.id;
    }

    return this.prismaService.match.update({
      where,
      data: { deletedAt: new Date(), status: 'cancelled' },
    });
  }

  private playerCodeToId(
    code: string | undefined,
    player1Id: number,
    player2Id: number,
  ) {
    if (code === 'A') return player1Id;
    if (code === 'B') return player2Id;
    return Number(code ?? 0);
  }
}
