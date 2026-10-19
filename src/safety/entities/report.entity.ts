import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum ReportReason { HARASSMENT = 'HARASSMENT', SCAM = 'SCAM', INAPPROPRIATE = 'INAPPROPRIATE', FAKE_PROFILE = 'FAKE_PROFILE', OTHER = 'OTHER' }
export enum ReportStatus { PENDING = 'PENDING', REVIEWED = 'REVIEWED', DISMISSED = 'DISMISSED' }

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column('integer') reporterId: number;
  @Index() @Column('integer') reportedUserId: number;
  @Column({ type: 'enum', enum: ReportReason }) reason: ReportReason;
  @Column({ type: 'text', nullable: true }) details: string | null;
  @Column({ type: 'uuid', nullable: true }) conversationId: string | null;
  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING }) status: ReportStatus;
  @CreateDateColumn() createdAt: Date;
}