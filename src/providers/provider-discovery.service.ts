import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

import { Provider } from './entities/provider.entity';
import {
  ProviderSortBy,
  SearchProvidersDto,
  SortOrder,
} from './dto/search-providers.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_KEYWORDS = 5;

const DISTANCE_SQL = `(CASE
  WHEN p.latitude IS NULL OR p.longitude IS NULL THEN NULL
  ELSE 6371 * acos(LEAST(1, GREATEST(-1,
    cos(radians(CAST(:lat AS double precision))) * cos(radians(p.latitude)) *
    cos(radians(p.longitude) - radians(CAST(:lng AS double precision))) +
    sin(radians(CAST(:lat AS double precision))) * sin(radians(p.latitude))
  )))
END)`;

export interface PublicProvider {
  id: number;
  providerName: string;
  bio: string | null;
  tradeCategory: string | null;
  location: string | null;
  skills: string[];
  yearsOfExperience: number;
  averageRating: number;
  reviewCount: number;
  distanceKm: number | null;
  createdAt: Date;
}

export interface ProviderSearchResult {
  data: PublicProvider[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class ProviderDiscoveryService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async search(query: SearchProvidersDto): Promise<ProviderSearchResult> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const sortBy = query.sortBy ?? ProviderSortBy.RATING;

    const hasLat = query.lat !== undefined;
    const hasLng = query.lng !== undefined;
    if (hasLat !== hasLng) {
      throw new BadRequestException('Send lat and lng together');
    }
    const hasCoordinates = hasLat && hasLng;

    if (sortBy === ProviderSortBy.DISTANCE && !hasCoordinates) {
      throw new BadRequestException('Sorting by distance needs lat and lng');
    }
    if (query.radiusKm !== undefined && !hasCoordinates) {
      throw new BadRequestException('radiusKm needs lat and lng');
    }

    const qb = this.visibleProviders();

    this.applyKeywords(qb, query.q);

    const category = query.tradeCategory?.trim();
    if (category) {
      qb.andWhere('LOWER(p.tradeCategory) = LOWER(:category)', { category });
    }

    const location = query.location?.trim();
    if (location) {
      qb.andWhere('p.location ILIKE :location', {
        location: `%${escapeLike(location)}%`,
      });
    }

    if (query.minYearsExperience !== undefined) {
      qb.andWhere('p.yearsOfExperience >= :minYears', {
        minYears: query.minYearsExperience,
      });
    }

    if (query.minRating !== undefined) {
      qb.andWhere('p.averageRating >= :minRating', {
        minRating: query.minRating,
      });
    }

    if (hasCoordinates) {
      qb.setParameters({ lat: query.lat, lng: query.lng });
      qb.addSelect(DISTANCE_SQL, 'distance_km');

      if (query.radiusKm !== undefined) {
        qb.andWhere('p.latitude IS NOT NULL AND p.longitude IS NOT NULL');
        qb.andWhere(`${DISTANCE_SQL} <= :radiusKm`, {
          radiusKm: query.radiusKm,
        });
      }
    }

    const total = await qb.clone().getCount();

    this.applySorting(qb, sortBy, query.order);
    qb.offset((page - 1) * limit).limit(limit);

    const { entities, raw } = await qb.getRawAndEntities<{
      p_id: number;
      distance_km?: string | null;
    }>();

    const distances = new Map<number, number | null>();
    for (const row of raw) {
      distances.set(
        row.p_id,
        row.distance_km === null || row.distance_km === undefined
          ? null
          : Number(row.distance_km),
      );
    }

    return {
      data: entities.map((provider) =>
        toPublicProvider(provider, distances.get(provider.id) ?? null),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<PublicProvider> {
    const provider = await this.visibleProviders()
      .andWhere('p.id = :id', { id })
      .getOne();

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return toPublicProvider(provider, null);
  }

  async listCategories(): Promise<{ category: string; count: number }[]> {
    const rows = await this.visibleProviders()
      .select('MIN(p.tradeCategory)', 'category')
      .addSelect('COUNT(*)', 'count')
      .andWhere('p.tradeCategory IS NOT NULL')
      .groupBy('LOWER(p.tradeCategory)')
      .orderBy('MIN(p.tradeCategory)', 'ASC')
      .getRawMany<{ category: string; count: string }>();

    return rows.map((row) => ({
      category: row.category,
      count: Number(row.count),
    }));
  }

  private visibleProviders(): SelectQueryBuilder<Provider> {
    return this.providerRepository
      .createQueryBuilder('p')
      .innerJoin('p.user', 'u')
      .where('p.status = :approved', { approved: 'approved' })
      .andWhere('u.status = :active', { active: 'active' });
  }

  private applyKeywords(
    qb: SelectQueryBuilder<Provider>,
    keywords: string | undefined,
  ): void {
    const words = (keywords ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, MAX_KEYWORDS);

    words.forEach((word, index) => {
      const param = `kw${index}`;
      qb.andWhere(
        new Brackets((group) => {
          group
            .where(`p.providerName ILIKE :${param}`)
            .orWhere(`p.bio ILIKE :${param}`)
            .orWhere(`p.tradeCategory ILIKE :${param}`)
            .orWhere(
              `EXISTS (SELECT 1 FROM unnest(p.skills) AS skill WHERE skill ILIKE :${param})`,
            );
        }),
        { [param]: `%${escapeLike(word)}%` },
      );
    });
  }

  private applySorting(
    qb: SelectQueryBuilder<Provider>,
    sortBy: ProviderSortBy,
    requestedOrder: SortOrder | undefined,
  ): void {
    const ascendingByDefault =
      sortBy === ProviderSortBy.DISTANCE || sortBy === ProviderSortBy.NAME;
    const direction =
      (requestedOrder ??
        (ascendingByDefault ? SortOrder.ASC : SortOrder.DESC)) === SortOrder.ASC
        ? 'ASC'
        : 'DESC';

    switch (sortBy) {
      case ProviderSortBy.DISTANCE:
        qb.orderBy('distance_km', direction, 'NULLS LAST');
        break;
      case ProviderSortBy.EXPERIENCE:
        qb.orderBy('p.yearsOfExperience', direction).addOrderBy(
          'p.averageRating',
          'DESC',
        );
        break;
      case ProviderSortBy.NAME:
        qb.orderBy('p.providerName', direction);
        break;
      case ProviderSortBy.NEWEST:
        qb.orderBy('p.createdAt', direction);
        break;
      case ProviderSortBy.RATING:
      default:
        qb.orderBy('p.averageRating', direction).addOrderBy(
          'p.reviewCount',
          'DESC',
        );
        break;
    }

    qb.addOrderBy('p.id', 'ASC');
  }
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

function toPublicProvider(
  provider: Provider,
  distanceKm: number | null,
): PublicProvider {
  return {
    id: provider.id,
    providerName: provider.providerName,
    bio: provider.bio,
    tradeCategory: provider.tradeCategory,
    location: provider.location,
    skills: provider.skills,
    yearsOfExperience: provider.yearsOfExperience,
    averageRating: provider.averageRating,
    reviewCount: provider.reviewCount,
    distanceKm: distanceKm === null ? null : Math.round(distanceKm * 10) / 10,
    createdAt: provider.createdAt,
  };
}