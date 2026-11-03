import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ReportReason } from '../entities/report.entity';

export class ReportUserDto {
  @ApiProperty({ enum: ReportReason, example: ReportReason.HARASSMENT })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiPropertyOptional({ example: 'Kept sending abusive messages.', maxLength: 1000 })
  @IsOptional() @IsString() @MaxLength(1000)
  details?: string;

  @ApiPropertyOptional({ example: '3f2b8c1e-5a4d-4e7b-9c2a-1d6e8f0a7b34', description: 'Conversation as evidence' })
  @IsOptional() @IsUUID()
  conversationId?: string;

  @ApiPropertyOptional({ example: true, default: false, description: 'Also block this user after reporting' })
  @IsOptional() @IsBoolean()
  alsoBlock?: boolean;
}