/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  //Put,
} from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  findAll(@Headers('authorization') authorization?: string) {
    return this.matchesService.findAll(authorization);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: any, @Headers('authorization') authorization?: string) {
    return this.matchesService.create(body, authorization);
  }

  @Post('reports')
  createReport(@Body() body: any, @Headers('authorization') authorization?: string) {
    return this.matchesService.createReport(body, authorization);
  }

  @Post(':id/rallies')
  createRally(@Param('id') id: string, @Body() body: any) {
    return this.matchesService.createRally(Number(id), body);
  }

  @Post(':id/shots')
  createShot(@Param('id') id: string, @Body() body: any) {
    return this.matchesService.createShot(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    return this.matchesService.remove(Number(id), authorization);
  }
}
