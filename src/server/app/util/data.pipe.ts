import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

@Injectable()
export class DataPipe implements PipeTransform {
transform(value: any, metadata: ArgumentMetadata) {
  const { metatype } = metadata;
  const convertedValue = plainToClass(metatype, value);
  return convertedValue;
}
}
