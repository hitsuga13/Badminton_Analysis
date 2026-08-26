import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll(@Headers('authorization') authorization?: string) {
    return this.playersService.findAll(authorization);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersService.findOne(Number(id));
  }

  @Post()
  create(@Body() body, @Headers('authorization') authorization?: string) {
    return this.playersService.create(body, authorization);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.playersService.update(Number(id), body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.playersService.remove(Number(id));
    return { deleted: true, id: Number(id) };
  }
}
