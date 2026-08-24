import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll() {
    return this.playersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersService.findOne(Number(id));
  }

  @Post()
  create(@Body() body) {
    return this.playersService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.playersService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.playersService.remove(Number(id));
    return { deleted: true };
  }
}
