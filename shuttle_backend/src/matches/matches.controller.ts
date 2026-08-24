/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  //Delete,
  Get,
  Param,
  Post,
  //Put,
} from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: any) {
    return this.matchesService.create(body);
  }

  @Post(':id/rallies')
  createRally(@Param('id') id: string, @Body() body: any) {
    return this.matchesService.createRally(Number(id), body);
  }

  @Post(':id/shots')
  createShot(@Param('id') id: string, @Body() body: any) {
    return this.matchesService.createShot(Number(id), body);
  }
}
