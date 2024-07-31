import { Test, TestingModule } from '@nestjs/testing';
import { CoordinatorMasterController } from './coordinator-master.controller';

describe('CoordinatorMasterController', () => {
  let controller: CoordinatorMasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoordinatorMasterController],
    }).compile();

    controller = module.get<CoordinatorMasterController>(CoordinatorMasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
