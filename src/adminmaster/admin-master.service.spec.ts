import { Test, TestingModule } from '@nestjs/testing';
import { AdminMasterService } from './admin-master.service';

describe('AdminMasterService', () => {
  let service: AdminMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminMasterService],
    }).compile();
    service = module.get<AdminMasterService>(AdminMasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
