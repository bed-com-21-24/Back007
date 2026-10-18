import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectProviderDto {
  @ApiProperty({
    description: 'Reason the provider listing is rejected',
    maxLength: 500,
    example: 'The listing does not meet the platform requirements.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
