import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MissionsRepository } from './data/missions.repository';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, MissionsRepository],
})
export class AppModule {}
