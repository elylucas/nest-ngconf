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
  createdAt = new Date();
  @Exclude()
  createdBy = 'user';
}
