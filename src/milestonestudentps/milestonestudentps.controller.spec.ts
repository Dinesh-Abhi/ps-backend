import { Test, TestingModule } from '@nestjs/testing';
import { MilestoneStudentPsController } from './milestonestudentps.controller';

describe('milestonestudentpscontroller', () => {
  let controller: MilestoneStudentPsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MilestoneStudentPsController],
    }).compile();

    controller = module.get<MilestoneStudentPsController>(MilestoneStudentPsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
