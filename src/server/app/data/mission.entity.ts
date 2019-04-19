import { Exclude } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean
} from 'class-validator';
import { Mission } from '../../../shared/models/mission.model';

export class MissionEntity implements Mission {
  id?: number;
  title: string;
  reward: number;
  active: boolean;

  @Exclude()
  createdAt = new Date();

  @Exclude()
  createdBy = 'user';
}
