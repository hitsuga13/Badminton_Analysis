/*
https://docs.nestjs.com/providers#services
*/
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return 'ni untuk return semua matches';
  }

  create(data: any) {
    return 'untuk match baru';
  }

  getMatches(): string {
    return 'Match Result';
  }
}
