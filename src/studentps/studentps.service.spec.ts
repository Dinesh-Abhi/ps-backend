import { Test, TestingModule } from '@nestjs/testing';
import { StudentPsService } from './studentps.service';

describe('StudentPsService', () => {
  let service: StudentPsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentPsService],
    }).compile();

    service = module.get<StudentPsService>(StudentPsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
