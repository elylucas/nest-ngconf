import { Injectable } from '@nestjs/common';
import { MissionsRepository } from '../data/missions.repository';
import { MissionEntity } from '../data/mission.entity';

@Injectable()
export class MissionsService {
  constructor(private missionsRepository: MissionsRepository) {}

}
