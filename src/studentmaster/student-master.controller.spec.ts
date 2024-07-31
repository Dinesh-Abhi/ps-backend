import { Test, TestingModule } from '@nestjs/testing';
import { StudentMasterController } from './student-master.controller';

describe('StudentMasterController', () => {
  let controller: StudentMasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentMasterController],
    }).compile();

    controller = module.get<StudentMasterController>(StudentMasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
