import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'member@example.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'a-new-strong-password',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
