/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MatchesController],
  providers: [MatchesService, PrismaService],
})
export class MatchesModule {}
