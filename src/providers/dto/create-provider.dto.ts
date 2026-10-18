import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({
    example: 'Alex Banda Plumbing',
    maxLength: 150,
    description: 'Name shown on the provider listing',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  providerName!: string;

  @ApiPropertyOptional({
    example: 'Licensed plumber with 10 years of experience.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({ example: 'Lilongwe', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;
}