import { Test, TestingModule } from '@nestjs/testing';
import { ProjectMasterService } from './project-master.service';

describe('ProjectMasterService', () => {
  let service: ProjectMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectMasterService],
    }).compile();

    service = module.get<ProjectMasterService>(ProjectMasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
