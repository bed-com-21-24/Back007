import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'Role to assign to the user',
    example: 'ADMIN',
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}
