import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProviderSkillsDto {
  @ApiProperty({
    type: [String],
    example: ['3d designer', 'phone repair', '3d modeling'],
    description: 'Complete list of provider skills',
  })
  @IsArray()
  @IsString({ each: true })
  skills!: string[];
}