import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Beston Chimpeni', description: 'User display name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'bed-com-21-24@unima.ac.mw', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'bestochmp122',
    minLength: 8,
    format: 'password',
  })
  @MinLength(8)
  password: string;
}