import { MatchesModule } from './matches/matches.module';
import { MatchesService } from './matches/matches.service';
import { MatchesController } from './matches/matches.controller';
import { PrismaService } from './prisma/prisma.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersModule } from './players/players.module';
import { TrainingModule } from './training/training.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MatchesModule, PlayersModule, TrainingModule, AuthModule],
  controllers: [MatchesController, AppController],
  providers: [MatchesService, PrismaService, AppService],
})
export class AppModule {}
