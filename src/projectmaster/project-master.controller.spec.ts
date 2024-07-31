import { Test, TestingModule } from '@nestjs/testing';
import { ProjectMasterController } from './project-master.controller';

describe('ProjectMasterController', () => {
  let controller: ProjectMasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectMasterController],
    }).compile();

    controller = module.get<ProjectMasterController>(ProjectMasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
