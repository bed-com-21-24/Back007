import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    example: 'I can visit tomorrow afternoon.',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString() @MinLength(1) @MaxLength(2000) body: string;
}