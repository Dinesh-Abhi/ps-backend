import { Test, TestingModule } from '@nestjs/testing';
import { AdminMasterController } from './admin-master.controller';

describe('AdminMasterController', () => {
  let controller: AdminMasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminMasterController],
    }).compile();

    controller = module.get<AdminMasterController>(AdminMasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
