import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let users: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let resetExistingPassword: boolean;

  beforeEach(async () => {
    resetExistingPassword = false;
    users = {
      findOne: jest.fn(),
      create: jest.fn((user: Partial<User>) => user as User),
      save: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: users },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) =>
              ({
                ADMIN_EMAIL: 'bed-com-25-24@unima.ac.mw',
                ADMIN_PASSWORD: 'configuredPass123',
              })[key],
            get: (key: string) =>
              key === 'ADMIN_RESET_PASSWORD_ON_STARTUP' && resetExistingPassword
                ? 'true'
                : undefined,
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates the predefined administrator using a hashed environment password', async () => {
    users.findOne.mockResolvedValue(null);
    users.save.mockImplementation(async (user: User) => user);

    await service.onModuleInit();

    const admin = users.save.mock.calls[0][0] as User;
    expect(admin).toMatchObject({
      email: 'bed-com-25-24@unima.ac.mw',
      role: 'admin',
      status: 'active',
    });
    expect(await bcrypt.compare('configuredPass123', admin.password)).toBe(
      true,
    );
  });

  it('only resets an existing admin password when explicitly enabled', async () => {
    const existingAdmin = {
      email: 'bed-com-25-24@unima.ac.mw',
      password: 'old-hash',
      role: 'admin',
      status: 'active',
    } as User;
    users.findOne.mockResolvedValue(existingAdmin);

    await service.onModuleInit();
    expect(existingAdmin.password).toBe('old-hash');
    expect(users.save).not.toHaveBeenCalled();

    resetExistingPassword = true;
    existingAdmin.password = 'old-hash';
    users.save.mockImplementation(async (user: User) => user);

    await service.onModuleInit();
    expect(
      await bcrypt.compare('configuredPass123', existingAdmin.password),
    ).toBe(true);
    expect(users.save).toHaveBeenCalledWith(existingAdmin);
  });

  it('changes a password only when the current password matches', async () => {
    const user = {
      id: 5,
      password: await bcrypt.hash('beforePass123', 10),
    } as User;
    users.findOne.mockResolvedValue(user);
    users.save.mockImplementation(async (saved: User) => saved);

    await expect(
      service.changePassword(5, 'wrongPass123', 'afterPass123'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(users.save).not.toHaveBeenCalled();

    await service.changePassword(5, 'beforePass123', 'afterPass123');
    expect(await bcrypt.compare('afterPass123', user.password)).toBe(true);
  });

  it('allows an authenticated user to reset only their own password', async () => {
    const ownUser = {
      id: 8,
      password: 'old-hash',
    } as User;
    users.findOne.mockResolvedValue(ownUser);
    users.save.mockImplementation(async (saved: User) => saved);

    await service.resetPassword(
      { email: 'member@example.com', newPassword: 'newPass123' },
      ownUser.id,
    );
    expect(await bcrypt.compare('newPass123', ownUser.password)).toBe(true);

    await expect(
      service.resetPassword(
        { email: 'member@example.com', newPassword: 'newPass456' },
        7,
      ),
    ).rejects.toThrow('You can only reset your own password');
  });
});
