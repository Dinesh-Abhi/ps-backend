import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminMasterController } from './super-admin-master.controller';

describe('SuperAdminMasterController', () => {
  let controller: SuperAdminMasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperAdminMasterController],
    }).compile();

    controller = module.get<SuperAdminMasterController>(SuperAdminMasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
