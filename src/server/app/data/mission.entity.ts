import { Exclude } from 'class-transformer';

export class MissionEntity {
  id?: number;
  title: string;
  reward: number;
  active: boolean;
  createdAt = new Date();
  createdBy = 'user';
}
