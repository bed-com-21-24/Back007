import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { Provider } from './entities/provider.entity';
import { ProviderReview } from './entities/provider-review.entity';

describe('ProvidersService', () => {
  let service: ProvidersService;
  let providers: {
    createQueryBuilder: jest.Mock;
  };
  let reviews: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let query: {
    addSelect: jest.Mock;
    andWhere: jest.Mock;
    getRawAndEntities: jest.Mock;
    groupBy: jest.Mock;
    leftJoin: jest.Mock;
    select: jest.Mock;
    where: jest.Mock;
  };

  beforeEach(async () => {
    query = {
      addSelect: jest.fn(),
      andWhere: jest.fn(),
      getRawAndEntities: jest.fn(),
      groupBy: jest.fn(),
      leftJoin: jest.fn(),
      select: jest.fn(),
      where: jest.fn(),
    };
    Object.values(query).forEach((method) => method.mockReturnValue(query));
    providers = {
      createQueryBuilder: jest.fn().mockReturnValue(query),
    };
    reviews = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((review) => review),
      save: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        { provide: getRepositoryToken(Provider), useValue: providers },
        { provide: getRepositoryToken(ProviderReview), useValue: reviews },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists providers with an aggregate rating and applies search filters', async () => {
    const profiles = [{ id: 1, status: 'approved' }];
    query.getRawAndEntities.mockResolvedValue({
      entities: profiles,
      raw: [{ averageRating: '4.5', reviewCount: '2' }],
    });

    await expect(
      service.findAll({
        keyword: 'plumber',
        skill: 'pipes',
        location: 'Blantyre',
      }),
    ).resolves.toEqual([
      { ...profiles[0], averageRating: 4.5, reviewCount: 2 },
    ]);
    expect(query.where).toHaveBeenCalledWith('provider.status = :status', {
      status: 'approved',
    });
    expect(query.andWhere).toHaveBeenCalledTimes(3);
  });

  it('returns provider review summaries with reviewer names only', async () => {
    const provider = {
      id: 3,
      userId: 20,
      status: 'approved',
      averageRating: 4,
      reviewCount: 1,
    };
    query.getRawAndEntities.mockResolvedValue({
      entities: [provider],
      raw: [{ averageRating: '4', reviewCount: '1' }],
    });
    reviews.find.mockResolvedValue([
      {
        id: 9,
        providerId: 3,
        userId: 7,
        rating: 4,
        review: 'Good work',
        createdAt: new Date('2026-01-01'),
        user: {
          id: 7,
          name: 'Reviewer',
          email: 'private@example.com',
          password: 'hash',
        },
      },
    ]);

    await expect(service.getReviews(3)).resolves.toMatchObject({
      providerId: 3,
      reviewCount: 1,
      averageRating: 4,
      reviews: [{ reviewer: { id: 7, name: 'Reviewer' } }],
    });
    const result = await service.getReviews(3);
    expect(result.reviews[0]).not.toHaveProperty('reviewer.email');
    expect(result.reviews[0]).not.toHaveProperty('user');
  });
});
