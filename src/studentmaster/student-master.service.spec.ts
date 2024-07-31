import { Test, TestingModule } from '@nestjs/testing';
import { StudentMasterService } from './student-master.service';

describe('StudentMasterService', () => {
  let service: StudentMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentMasterService],
    }).compile();

    service = module.get<StudentMasterService>(StudentMasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
