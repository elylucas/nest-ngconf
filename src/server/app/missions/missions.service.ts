import { Injectable } from '@nestjs/common';
import { MissionsRepository } from '../data/missions.repository';

@Injectable()
export class MissionsService {
  constructor(private missionsRepository: MissionsRepository) {}

  getMissions() {
    return this.missionsRepository.getList();
  }
}
