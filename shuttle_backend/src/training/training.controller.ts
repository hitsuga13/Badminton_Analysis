import { Body, Controller, Delete, Get, Headers, Param, Post } from '@nestjs/common';
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
  create(@Body() body: any, @Headers('authorization') authorization?: string) {
    return this.trainingService.create(body, authorization);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainingService.remove(Number(id));
  }
}
