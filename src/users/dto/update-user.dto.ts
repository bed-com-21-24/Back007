import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'bwefu mwenengana',
    minLength: 2,
    description: 'Updated user display name',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'bed-mat-04-24@unima.ac.mw', format: 'email' })
  @IsOptional()
  @IsEmail()
  email?: string;
}