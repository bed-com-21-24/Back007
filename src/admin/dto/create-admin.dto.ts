import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Alex Banda', description: 'Administrator name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'bed-com-25-24@unima.ac.mw', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'chipalamoto12',
    format: 'password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
