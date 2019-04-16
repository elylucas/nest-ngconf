import { Injectable } from '@nestjs/common';
import { MissionsRepository } from '../data/missions.repository';
import { MissionEntity } from '../data/mission.entity';

@Injectable()
export class MissionsService {
  constructor(private missionsRepository: MissionsRepository) {}

  getMissions() {
    return this.missionsRepository.getList();
  }

  getMission(id: number) {
    return this.missionsRepository.get(id);
  }

  createMission(mission: MissionEntity) {
    return this.missionsRepository.create(mission);
  }

  async updateMission(id: number, mission: MissionEntity) {
    const current = await this.getMission(id);
    if (!current) {
      return null;
    }
    mission.createdAt = current.createdAt;
    mission.createdBy = current.createdBy;
    return this.missionsRepository.update(id, mission);
  }

  deleteMission(id: number) {
    return this.missionsRepository.delete(id);
  }
}
