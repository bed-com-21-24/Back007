import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class StartConversationDto {
  @ApiProperty({ example: 1, description: 'ID of the provider you want to contact' })
  @IsInt()
  providerId: number;

  @ApiProperty({ example: 'Hi, are you available this Saturday?', maxLength: 2000 })
  @IsString() @MinLength(1) @MaxLength(2000)
  message: string;
}