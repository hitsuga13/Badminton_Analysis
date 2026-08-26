import { MatchesModule } from './matches/matches.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersModule } from './players/players.module';
import { TrainingModule } from './training/training.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MatchesModule, PlayersModule, TrainingModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
