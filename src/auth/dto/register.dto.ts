import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Alex Banda', description: 'User display name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'alex@example.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'securePass123',
    minLength: 8,
    format: 'password',
  })
  @MinLength(8)
  password: string;
}