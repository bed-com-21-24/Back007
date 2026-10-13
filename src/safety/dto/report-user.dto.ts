import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ReportReason } from '../entities/report.entity';

export class ReportUserDto {
  @IsEnum(ReportReason) reason: ReportReason;
  @IsOptional() @IsString() @MaxLength(1000) details?: string;
  @IsOptional() @IsUUID() conversationId?: string;
}