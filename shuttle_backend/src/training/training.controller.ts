import { Body, Controller, Delete, Get, Headers, Param, Post } from '@nestjs/common';
import { TrainingService } from './training.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  findAll(@Headers('authorization') authorization?: string) {
    return this.trainingService.findAll(authorization);
  }

  @Get('player/:playerId')
  findByPlayer(@Param('playerId') playerId: string, @Headers('authorization') authorization?: string) {
    return this.trainingService.findByPlayer(Number(playerId), authorization);
  }

  @Post()
  create(@Body() body: any, @Headers('authorization') authorization?: string) {
    return this.trainingService.create(body, authorization);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    return this.trainingService.remove(Number(id), authorization);
  }
}
