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

  @Get(':id')
  async getMission(@Param('id') id: number) {
    return this.missionsService.getMission(id);
  }

  @Roles('user')
  @Post()
  async createMission(@Body() mission: MissionEntity) {
    return this.missionsService.createMission(mission);
  }

  @Roles('user')
  @Put(':id')
  async updateMission(@Param('id') id: number, @Body() mission: MissionEntity) {
    return this.missionsService.updateMission(id, mission);
  }

  @Roles('admin')
  @Delete(':id')
  async deleteMission(@Param('id') id: number) {
    return this.missionsService.deleteMission(id);
  }
}
