import { IsArray, IsString } from 'class-validator';

export class UpdateProviderSkillsDto {
  @IsArray()
  @IsString({ each: true })
  skills!: string[];
}