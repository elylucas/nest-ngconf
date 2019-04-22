import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MissionsRepository } from './data/missions.repository';
import { MissionsService } from './missions/missions.service';
import { MissionsController } from './missions/missions.controller';
import { APP_INTERCEPTOR, APP_PIPE, APP_GUARD } from '@nestjs/core';
import { DataInterceptor } from './util/data.interceptor';
import { DataPipe } from './util/data.pipe';
import { AuthGuard } from './util/auth.guard';
import { UsersService } from './users/users.service';

@Module({
  imports: [],
  controllers: [AppController, MissionsController],
  providers: [
    AppService,
    MissionsRepository,
    MissionsService,
    UsersService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataInterceptor
    },
    {
      provide: APP_PIPE,
      useClass: DataPipe
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ]
})
export class AppModule {}
