import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request
} from '@nestjs/common';
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

  @Roles('user')
  @Post()
  async createMission(@Body() mission: MissionEntity, @GetUser() user: User) {
    mission.createdBy = user.id;
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
