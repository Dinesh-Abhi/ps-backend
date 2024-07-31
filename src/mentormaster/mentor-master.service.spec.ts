import { Test, TestingModule } from '@nestjs/testing';
import { MentorMasterService } from './mentor-master.service';

describe('MentorMasterService', () => {
  let service: MentorMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentorMasterService],
    }).compile();

    service = module.get<MentorMasterService>(MentorMasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
