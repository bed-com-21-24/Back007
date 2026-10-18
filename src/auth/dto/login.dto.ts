import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'alex@example.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePass123', format: 'password' })
  @IsNotEmpty()
  password: string;
}