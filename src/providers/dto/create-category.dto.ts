import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Plumbing' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: ['Pipe repair', 'Leak detection'] })
  @IsArray()
  @IsString({ each: true })
  skills!: string[];
}