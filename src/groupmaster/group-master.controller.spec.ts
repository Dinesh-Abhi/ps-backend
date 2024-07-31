import { Test, TestingModule } from '@nestjs/testing';
import { GroupMasterController } from './group-master.controller';

describe('GroupMasterController', () => {
  let controller: GroupMasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupMasterController],
    }).compile();

    controller = module.get<GroupMasterController>(GroupMasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
