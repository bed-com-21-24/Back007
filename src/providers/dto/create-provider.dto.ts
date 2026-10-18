import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({
    example: 'maxwell chitukula',
    maxLength: 150,
    description: 'Name shown on the provider listing',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  providerName!: string;

  @ApiPropertyOptional({
    example: 'Licensed cellphone repairer with 5 years of experience.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({ example: 'Chitipa', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;
}