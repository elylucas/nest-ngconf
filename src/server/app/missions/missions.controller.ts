import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { MissionEntity } from '../data/mission.entity';
import { Roles } from '../util/roles.decorator';

@Controller('missions')
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

  @Get()
  async getMissions() {
    return this.missionsService.getMissions();
  }
}
