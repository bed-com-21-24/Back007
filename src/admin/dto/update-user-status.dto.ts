import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['active', 'suspended', 'banned'] })
  @IsIn(['active', 'suspended', 'banned'])
  status: 'active' | 'suspended' | 'banned';
}
