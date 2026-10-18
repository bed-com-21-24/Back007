import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Alex Banda',
    minLength: 2,
    description: 'Updated user display name',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'alex@example.com', format: 'email' })
  @IsOptional()
  @IsEmail()
  email?: string;
}