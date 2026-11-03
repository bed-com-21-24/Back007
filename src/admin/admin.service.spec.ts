import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Provider } from '../providers/entities/provider.entity';
import { Report } from '../safety/entities/report.entity';

describe('AdminService', () => {
  let service: AdminService;
  let users: jest.Mocked<
    Pick<
      Repository<User>,
      'count' | 'find' | 'findOne' | 'findOneBy' | 'create' | 'save'
    >
  >;
  let providers: jest.Mocked<
    Pick<
      Repository<Provider>,
      'count' | 'find' | 'findOneBy' | 'remove' | 'save'
    >
  >;
  let reports: jest.Mocked<Pick<Repository<Report>, 'find'>>;

  beforeEach(async () => {
    users = {
      count: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn((entity) => entity as User),
      save: jest.fn(),
    };
    providers = {
      count: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
      save: jest.fn(),
    };
    reports = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: users },
        { provide: getRepositoryToken(Provider), useValue: providers },
        { provide: getRepositoryToken(Report), useValue: reports },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates an administrator in the users table with a hashed password', async () => {
    const dto = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'securePass123',
    };
    users.findOne.mockResolvedValue(null);
    users.save.mockImplementation(async (user) => user as User);

    const result = await service.createAdmin(dto);

    expect(result).toMatchObject({
      name: dto.name,
      email: dto.email,
      role: 'admin',
      status: 'active',
    });
    expect(result).not.toHaveProperty('password');
    expect(
      await bcrypt.compare(dto.password, users.save.mock.calls[0][0].password),
    ).toBe(true);
  });

  it('includes provider profiles with users without exposing passwords', async () => {
    users.find.mockResolvedValue([
      {
        id: 1,
        name: 'Provider User',
        email: 'provider@example.com',
        password: 'hash',
        role: 'resident',
        status: 'active',
        provider: {
          id: 1,
          userId: 1,
          providerName: 'Plumber',
          user: { password: 'nested-hash' },
        },
      } as User,
    ]);

    const [result] = await service.getUsers();

    expect(result).toHaveProperty('provider.providerName', 'Plumber');
    expect(result).not.toHaveProperty('password');
    expect(result.provider).not.toHaveProperty('user');
  });

  it('rejects and removes the provider profile without deleting its user', async () => {
    const provider = { id: 1, userId: 1 } as Provider;
    providers.findOneBy.mockResolvedValue(provider);
    providers.remove.mockResolvedValue(provider);

    const result = await service.rejectProvider(1, {
      reason: 'Does not meet requirements',
    });

    expect(result.status).toBe('rejected');
    expect(providers.remove).toHaveBeenCalledWith(provider);
    expect(users.save).not.toHaveBeenCalled();
  });

  it('returns reports with safe user details and provider map coordinates', async () => {
    reports.find.mockResolvedValue([
      {
        id: 'report-id',
        reporterId: 1,
        reportedUserId: 2,
        reason: 'SCAM',
        details: null,
        conversationId: null,
        status: 'PENDING',
        createdAt: new Date(),
      } as Report,
    ]);
    users.find.mockResolvedValue([
      {
        id: 1,
        name: 'Reporter',
        email: 'reporter@example.com',
        password: 'secret',
        refreshTokenHash: 'secret-hash',
      } as User,
      {
        id: 2,
        name: 'Reported user',
        email: 'reported@example.com',
        password: 'secret',
        refreshTokenHash: 'secret-hash',
      } as User,
    ]);
    providers.find.mockResolvedValue([
      {
        id: 10,
        userId: 2,
        providerName: 'Plumber',
        location: 'Lilongwe',
        latitude: -13.96,
        longitude: 33.78,
        user: { password: 'secret' },
      } as Provider,
    ]);

    const [result] = await service.getReports();

    expect(result.reportedUser).toMatchObject({
      id: 2,
      name: 'Reported user',
    });
    expect(result.reporter).toMatchObject({ id: 1, name: 'Reporter' });
    expect(result.location).toEqual({
      latitude: -13.96,
      longitude: 33.78,
      address: 'Lilongwe',
    });
    expect(result.reportedUser).not.toHaveProperty('password');
    expect(result.reportedUser).not.toHaveProperty('refreshTokenHash');
  });

  it('requires a rejection reason in the unified provider action', async () => {
    await expect(
      service.providerAction(1, { action: 'reject' }),
    ).rejects.toThrow('A reason is required when rejecting a provider listing');
    expect(providers.findOneBy).not.toHaveBeenCalled();
  });
});
