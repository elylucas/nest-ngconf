import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException
} from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = new Date().getTime();
    return next.handle().pipe(
      map(data => {
        if (data == null) {
          return new NotFoundException();
        }
        const endTime = new Date().getTime();
        const timing = endTime - startTime;
        return {
          data: classToPlain(data),
          timing
        };
      })
    );
  }
}
