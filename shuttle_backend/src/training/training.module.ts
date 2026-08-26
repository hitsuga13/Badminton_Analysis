import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TrainingController],
  providers: [TrainingService, PrismaService],
})
export class TrainingModule {}
