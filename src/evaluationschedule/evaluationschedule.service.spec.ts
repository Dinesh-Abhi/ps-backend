import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationscheduleService } from './evaluationschedule.service';

describe('EvaluationscheduleService', () => {
  let service: EvaluationscheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluationscheduleService],
    }).compile();

    service = module.get<EvaluationscheduleService>(EvaluationscheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
