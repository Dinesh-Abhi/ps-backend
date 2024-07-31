import { Test, TestingModule } from '@nestjs/testing';
import { MentorMasterController } from './mentor-master.controller';

describe('MentorMasterController', () => {
  let controller: MentorMasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorMasterController],
    }).compile();

    controller = module.get<MentorMasterController>(MentorMasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
