import { Test, TestingModule } from '@nestjs/testing';
import { PsMasterService } from './ps-master.service';

describe('PsMasterService', () => {
  let service: PsMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PsMasterService],
    }).compile();

    service = module.get<PsMasterService>(PsMasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
