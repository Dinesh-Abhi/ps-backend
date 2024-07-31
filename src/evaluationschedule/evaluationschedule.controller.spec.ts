import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationscheduleController } from './evaluationschedule.controller';
import { EvaluationscheduleService } from './evaluationschedule.service';

describe('EvaluationscheduleController', () => {
  let controller: EvaluationscheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationscheduleController],
      providers: [EvaluationscheduleService],
    }).compile();

    controller = module.get<EvaluationscheduleController>(EvaluationscheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
