import { Test, TestingModule } from '@nestjs/testing';
import { GroupMasterService } from './group-master.service';

describe('GroupMasterService', () => {
  let service: GroupMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupMasterService],
    }).compile();

    service = module.get<GroupMasterService>(GroupMasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
