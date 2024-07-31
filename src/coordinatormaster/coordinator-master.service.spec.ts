import { Test, TestingModule } from '@nestjs/testing';
import { CoordinatorMasterService } from './coordinator-master.service';

describe('CoordinatorMasterService', () => {
  let service: CoordinatorMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoordinatorMasterService],
    }).compile();

    service = module.get<CoordinatorMasterService>(CoordinatorMasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
