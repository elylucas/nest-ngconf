import { ReflectMetadata } from '@nestjs/common';

export const Roles = (...args: string[]) => ReflectMetadata('roles', args);
