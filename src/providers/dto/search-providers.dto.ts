import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchProvidersDto {
  @ApiPropertyOptional({
    description: 'Search provider names, bios, and listed skills',
    example: 'plumber',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Filter by a listed skill or product/service keyword',
    example: 'pipe repair',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  skill?: string;

  @ApiPropertyOptional({ example: 'Blantyre' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;
}
