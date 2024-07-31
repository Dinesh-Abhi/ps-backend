import { Test, TestingModule } from '@nestjs/testing';
import { StudentPsController } from './studentps.controller';

describe('StudentPsController', () => {
  let controller: StudentPsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentPsController],
    }).compile();

    controller = module.get<StudentPsController>(StudentPsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
