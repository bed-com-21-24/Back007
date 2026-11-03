import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProviderActionDto {
  @ApiProperty({ enum: ['approve', 'reject', 'delete'] })
  @IsIn(['approve', 'reject', 'delete'])
  action: 'approve' | 'reject' | 'delete';

  @ApiPropertyOptional({
    description: 'Required when rejecting a provider listing',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
