import { Test, TestingModule } from '@nestjs/testing';
import { EvaluatorMasterController } from './evaluator-master.controller';

describe('EvaluatorMasterController', () => {
  let controller: EvaluatorMasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluatorMasterController],
    }).compile();

    controller = module.get<EvaluatorMasterController>(EvaluatorMasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
