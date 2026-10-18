import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ReportReason } from '../entities/report.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportUserDto {
  @ApiProperty({
    enum: ReportReason,
    example: ReportReason.HARASSMENT,
    description: 'Reason for reporting the user',
  })
  @IsEnum(ReportReason) reason: ReportReason;

  @ApiPropertyOptional({
    example: 'The user sent repeated unwanted messages he said he is from phoka.',
    maxLength: 1000,
  })
  @IsOptional() @IsString() @MaxLength(1000) details?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    example: '7b7a6cd2-0cc2-4df1-a4d1-9b110d80a5bc',
    description: 'Related conversation, if applicable',
  })
  @IsOptional() @IsUUID() conversationId?: string;
}