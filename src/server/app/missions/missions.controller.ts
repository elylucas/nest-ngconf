import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MissionEntity } from '../data/mission.entity';
import { User } from '../models/user.model';
import { Roles } from '../util/roles.decorator';
import { MissionsService } from './missions.service';
import { GetUser } from '../util/getuser.decorator';

@Controller('missions')
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

}
