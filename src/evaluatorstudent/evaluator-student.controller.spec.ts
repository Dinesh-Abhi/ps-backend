import { Test, TestingModule } from '@nestjs/testing';
import { EvaluatorStudentController } from './evaluator-student.controller';

describe('EvaluatorStudentController', () => {
  let controller: EvaluatorStudentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluatorStudentController],
    }).compile();

    controller = module.get<EvaluatorStudentController>(EvaluatorStudentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
