import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'alex@example.com', format: 'email' })
  @IsEmail()
  email: string;
}