import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactProviderDto {
  @ApiProperty({
    example: 'Hello, katundu uja timpeza or not?',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString() @MinLength(1) @MaxLength(2000) message: string;
}