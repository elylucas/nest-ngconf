import { Exclude } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean
} from 'class-validator';
import { Mission } from '../../../shared/models/mission.model';

export class MissionEntity {
  id?: number;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDefined()
  @IsNumber()
  reward: number;

  @IsDefined()
  @IsBoolean()
  active: boolean;

  @Exclude()
  createdAt: Date = new Date();
  @Exclude()
  createdBy = 'user';
}
