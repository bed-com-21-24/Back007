import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'alex@example.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'newSecurePass123',
    minLength: 8,
    format: 'password',
  })
  @MinLength(8)
  newPassword: string;
}