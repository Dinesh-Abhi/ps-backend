import { Test, TestingModule } from '@nestjs/testing';
import { EvaluatorMasterService } from './evaluator-master.service';

describe('EvaluatorMasterService', () => {
  let service: EvaluatorMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluatorMasterService],
    }).compile();

    service = module.get<EvaluatorMasterService>(EvaluatorMasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
