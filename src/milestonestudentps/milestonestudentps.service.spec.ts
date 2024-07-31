import { Test, TestingModule } from '@nestjs/testing';
import { MilestoneStudentPsService } from './milestonestudentps.service';

describe('milestonestudentpsservice', () => {
  let service: MilestoneStudentPsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MilestoneStudentPsService],
    }).compile();

    service = module.get<MilestoneStudentPsService>(MilestoneStudentPsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
