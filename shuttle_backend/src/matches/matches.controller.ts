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

  @Post()
  create(@Body() body: any) {
    return this.matchesService.create(body);
  }
}
