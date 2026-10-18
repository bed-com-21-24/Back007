import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Alex Banda', description: 'Administrator name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin@example.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'securePass123',
    format: 'password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
