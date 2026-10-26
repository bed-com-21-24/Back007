import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'simbeyemwiza7@gmail.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'nzunda1234', format: 'password' })
  @IsNotEmpty()
  password: string;
}