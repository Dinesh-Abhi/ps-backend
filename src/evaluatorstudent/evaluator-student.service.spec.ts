import { Test, TestingModule } from '@nestjs/testing';
import { EvaluatorStudentService } from './evaluator-student.service';

describe('EvaluatorStudentService', () => {
  let service: EvaluatorStudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluatorStudentService],
    }).compile();

    service = module.get<EvaluatorStudentService>(EvaluatorStudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
