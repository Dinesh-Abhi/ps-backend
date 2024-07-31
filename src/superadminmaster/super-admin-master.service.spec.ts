import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminMasterService } from './super-admin-master.service';

describe('SuperusermasterService', () => {
  let service: SuperAdminMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuperAdminMasterService],
    }).compile();

    service = module.get<SuperAdminMasterService>(SuperAdminMasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
