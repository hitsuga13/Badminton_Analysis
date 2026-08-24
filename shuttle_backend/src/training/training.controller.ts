import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TrainingService } from './training.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  findAll() {
    return this.trainingService.findAll();
  }

  @Get('player/:playerId')
  findByPlayer(@Param('playerId') playerId: string) {
    return this.trainingService.findByPlayer(Number(playerId));
  }

  @Post()
  create(@Body() body: any) {
    return this.trainingService.create(body);
  }
}
