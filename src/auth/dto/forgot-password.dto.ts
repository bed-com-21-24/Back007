import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'chikulamayembe@gmai.org', format: 'email' })
  @IsEmail()
  email: string;
}