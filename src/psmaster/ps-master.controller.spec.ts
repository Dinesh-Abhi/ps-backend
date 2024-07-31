import { Test, TestingModule } from '@nestjs/testing';
import { PsMasterController } from './ps-master.controller';

describe('PsMasterController', () => {
  let controller: PsMasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PsMasterController],
    }).compile();

    controller = module.get<PsMasterController>(PsMasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
