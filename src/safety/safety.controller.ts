import { Body, Controller, Delete, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';   // adjust to the real path and name
import { BlocksService } from './blocks.service';
import { ReportsService } from './reports.service';
import { ReportUserDto } from './dto/report-user.dto';

@Controller('users')            // the CLI generated 'safety'. Change it to 'users'
@UseGuards(JwtAuthGuard)
export class SafetyController {
  constructor(private blocks: BlocksService, private reports: ReportsService) {}

  @Post(':id/report')
  report(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ReportUserDto) {
    return this.reports.create(req.user.id, id, dto);
  }

  @Post(':id/block')
  block(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.blocks.block(req.user.id, id);
  }

  @Delete(':id/block')
  unblock(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.blocks.unblock(req.user.id, id);
  }
}