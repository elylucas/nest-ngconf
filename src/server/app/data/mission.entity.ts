import { Exclude } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean
} from 'class-validator';

export class MissionEntity {
  id?: number;
  title: string;
  reward: number;
  active: boolean;
  createdAt = new Date();
  createdBy = 'user';
}
