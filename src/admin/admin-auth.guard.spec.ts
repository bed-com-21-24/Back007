import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { AdminAuthGuard } from './admin-auth.guard';

describe('AdminAuthGuard', () => {
  let guard: AdminAuthGuard;
  let userRepository: jest.Mocked<Pick<Repository<User>, 'findOne'>>;
  let request: { user?: { id?: number } };

  beforeEach(async () => {
    request = {};
    userRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthGuard,
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn((context: ExecutionContext) => {
              context.switchToHttp().getRequest().user = { id: 1 };
              return true;
            }),
          },
        },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    guard = module.get<AdminAuthGuard>(AdminAuthGuard);
  });

  it('allows an active administrator', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      role: 'admin',
      status: 'active',
    } as User);

    const allowed = await guard.canActivate({
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext);

    expect(allowed).toBe(true);
  });

  it('rejects authenticated users without the administrator role', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      role: 'resident',
      status: 'active',
    } as User);

    await expect(
      guard.canActivate({
        switchToHttp: () => ({ getRequest: () => request }),
      } as ExecutionContext),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects inactive administrator accounts', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      role: 'admin',
      status: 'suspended',
    } as User);

    await expect(
      guard.canActivate({
        switchToHttp: () => ({ getRequest: () => request }),
      } as ExecutionContext),
    ).rejects.toThrow(ForbiddenException);
  });
});
