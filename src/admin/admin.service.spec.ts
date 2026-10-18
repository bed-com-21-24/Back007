import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Provider } from '../providers/entities/provider.entity';

describe('AdminService', () => {
  let service: AdminService;
  let users: jest.Mocked<Pick<Repository<User>, 'count' | 'find' | 'findOne' | 'findOneBy' | 'create' | 'save'>>;
  let providers: jest.Mocked<Pick<Repository<Provider>, 'count' | 'findOneBy' | 'remove' | 'save'>>;

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
      findOneBy: jest.fn(),
      remove: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: users },
        { provide: getRepositoryToken(Provider), useValue: providers },
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
        id: 'user-id',
        name: 'Provider User',
        email: 'provider@example.com',
        password: 'hash',
        role: 'resident',
        status: 'active',
        provider: {
          id: 'provider-id',
          userId: 'user-id',
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
    const provider = { id: 'provider-id', userId: 'user-id' } as Provider;
    providers.findOneBy.mockResolvedValue(provider);
    providers.remove.mockResolvedValue(provider);

    const result = await service.rejectProvider('provider-id', {
      reason: 'Does not meet requirements',
    });

    expect(result.status).toBe('rejected');
    expect(providers.remove).toHaveBeenCalledWith(provider);
    expect(users.save).not.toHaveBeenCalled();
  });
});
