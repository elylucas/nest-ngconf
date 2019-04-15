import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MissionsRepository } from './data/missions.repository';
import { MissionsService } from './missions/missions.service';
import { MissionsController } from './missions/missions.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataInterceptor } from './util/data.interceptor';

@Module({
  imports: [],
  controllers: [AppController, MissionsController],
  providers: [
    AppService,
    MissionsRepository,
    MissionsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataInterceptor
    }
  ]
})
export class AppModule {}
