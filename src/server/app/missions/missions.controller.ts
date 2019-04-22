import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MissionEntity } from '../data/mission.entity';
import { User } from '../models/user.model';
import { Roles } from '../util/roles.decorator';
import { MissionsService } from './missions.service';
import { GetUser } from '../util/getuser.decorator';

@Controller('missions')
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

  @Get()
  async getMissions() {
    return this.missionsService.getMissions();
  }

  @Get(':id')
  async getMission(@Param('id') id: number) {
    return this.missionsService.getMission(id);
  }

  @Post()
  async createMission(@Body() mission: MissionEntity) {
    return this.missionsService.createMission(mission);
  }

  @Put(':id')
  async updateMission(@Param('id') id: number, @Body() mission: MissionEntity) {
    return this.missionsService.updateMission(id, mission);
  }

  @Delete(':id')
  async deleteMission(@Param('id') id: number) {
    return this.missionsService.deleteMission(id);
  }
}
