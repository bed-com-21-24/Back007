import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum ProviderSortBy {
  RATING = 'rating',
  DISTANCE = 'distance',
  EXPERIENCE = 'experience',
  NAME = 'name',
  NEWEST = 'newest',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchProvidersDto {
  @ApiPropertyOptional({ example: 'phone repair' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ example: 'Electrician' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tradeCategory?: string;

  @ApiPropertyOptional({ example: 'Zomba' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @ApiPropertyOptional({ example: 2, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minYearsExperience?: number;

  @ApiPropertyOptional({ example: 4, minimum: 0, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ example: -15.3875, minimum: -90, maximum: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({ example: 35.3188, minimum: -180, maximum: 180 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @ApiPropertyOptional({ example: 25, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  radiusKm?: number;

  @ApiPropertyOptional({
    enum: ProviderSortBy,
    default: ProviderSortBy.RATING,
  })
  @IsOptional()
  @IsEnum(ProviderSortBy)
  sortBy?: ProviderSortBy;

  @ApiPropertyOptional({ enum: SortOrder })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;

  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}