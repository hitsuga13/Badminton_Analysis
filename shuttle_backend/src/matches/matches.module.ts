/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  //imports: [],
  controllers: [MatchesController],
  providers: [MatchesService, PrismaService],
})
export class MatchesModule {}
