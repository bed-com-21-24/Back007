import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportUserDto } from './dto/report-user.dto';
import { Report, ReportStatus } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  async create(reporterId: string, reportedUserId: string, dto: ReportUserDto) {
    if (reporterId === reportedUserId) throw new BadRequestException('You cannot report yourself');
    const dup = await this.repo.findOne({ where: { reporterId, reportedUserId, status: ReportStatus.PENDING } });
    if (dup) throw new ConflictException('You already have a pending report against this user');
    return this.repo.save(this.repo.create({
      reporterId, reportedUserId, reason: dto.reason,
      details: dto.details ?? null, conversationId: dto.conversationId ?? null,
    }));
  }
}