import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateUserDto } from '../../users/dto/update-user.dto';

export class AdminUpdateUserDto extends UpdateUserDto {
  @ApiPropertyOptional({ example: 'resident' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  role?: string;
}
