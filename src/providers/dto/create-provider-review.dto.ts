import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateProviderReviewDto {
  @ApiProperty({
    description: 'Rating from 1 to 5 stars',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    description: 'Optional written review',
    maxLength: 2000,
    example: 'Arrived on time and repaired the pipe carefully.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  review?: string;
}
