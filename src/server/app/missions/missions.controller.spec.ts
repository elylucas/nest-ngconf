import { Test, TestingModule } from '@nestjs/testing';
import { MissionsController } from './missions.controller';

describe('Missions Controller', () => {
  let controller: MissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MissionsController],
    }).compile();

    controller = module.get<MissionsController>(MissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
