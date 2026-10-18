import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProviderSkillsDto {
  @ApiProperty({
    type: [String],
    example: ['Plumbing', 'Pipe repair'],
    description: 'Complete list of provider skills',
  })
  @IsArray()
  @IsString({ each: true })
  skills!: string[];
}