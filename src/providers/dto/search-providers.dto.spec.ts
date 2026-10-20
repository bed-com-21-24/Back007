import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { SearchProvidersDto } from './search-providers.dto';

describe('SearchProvidersDto', () => {
  const check = (plain: Record<string, unknown>) =>
    validate(plainToInstance(SearchProvidersDto, plain));

  it('accepts an empty query', async () => {
    expect(await check({})).toHaveLength(0);
  });

  it('converts query-string values (always strings) to numbers', async () => {
    const dto = plainToInstance(SearchProvidersDto, {
      minRating: '4.5',
      minYearsExperience: '3',
      page: '2',
      limit: '20',
      lat: '-15.38',
      lng: '35.31',
      radiusKm: '25',
      sortBy: 'distance',
      order: 'asc',
    });

    expect(await validate(dto)).toHaveLength(0);
    expect(dto.minRating).toBe(4.5);
    expect(dto.minYearsExperience).toBe(3);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
    expect(dto.lat).toBe(-15.38);
  });

  it.each([
    ['page below 1', { page: '0' }],
    ['limit above 50', { limit: '51' }],
    ['limit below 1', { limit: '0' }],
    ['rating above 5', { minRating: '6' }],
    ['rating below 0', { minRating: '-1' }],
    ['rating that is not a number', { minRating: 'abc' }],
    ['latitude out of range', { lat: '95', lng: '0' }],
    ['longitude out of range', { lat: '0', lng: '181' }],
    ['radius below 1 km', { radiusKm: '0' }],
    ['unknown sort field', { sortBy: 'popularity' }],
    ['unknown sort order', { order: 'sideways' }],
    ['negative experience', { minYearsExperience: '-1' }],
    ['non-whole experience', { minYearsExperience: '2.5' }],
    ['keyword over 100 characters', { q: 'x'.repeat(101) }],
  ])('rejects %s', async (_label, plain) => {
    expect((await check(plain)).length).toBeGreaterThan(0);
  });
});