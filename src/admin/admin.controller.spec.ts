import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            getDashboard: jest.fn(),
            getUsers: jest.fn(),
            updateUser: jest.fn(),
            createAdmin: jest.fn(),
            suspendUser: jest.fn(),
            banUser: jest.fn(),
            deleteProvider: jest.fn(),
            approveProvider: jest.fn(),
            rejectProvider: jest.fn(),
            updateUserRole: jest.fn(),
            getUsageReport: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
