import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'chimwemwe7@gmail.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'karongabwayi71',
    minLength: 8,
    format: 'password',
  })
  @MinLength(8)
  newPassword: string;
}