import { Body, Controller, Delete, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';   // adjust to the real path and name
import { BlocksService } from './blocks.service';
import { ReportsService } from './reports.service';
import { ReportUserDto } from './dto/report-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('users')            // the CLI generated 'safety'. Change it to 'users'
@UseGuards(JwtAuthGuard)
@ApiTags('safety')
@ApiBearerAuth()
export class SafetyController {
  constructor(private blocks: BlocksService, private reports: ReportsService) {}

  @Post(':id/report')
  @ApiOperation({ summary: 'Report a user' })
  @ApiParam({ name: 'id', description: 'UUID of the reported user' })
  @ApiResponse({ status: 201, description: 'User report submitted' })
  report(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ReportUserDto) {
    return this.reports.create(req.user.id, id, dto);
  }

  @Post(':id/block')
  @ApiOperation({ summary: 'Block a user' })
  @ApiParam({ name: 'id', description: 'UUID of the user to block' })
  @ApiResponse({ status: 201, description: 'User blocked' })
  block(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.blocks.block(req.user.id, id);
  }

  @Delete(':id/block')
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiParam({ name: 'id', description: 'UUID of the user to unblock' })
  @ApiResponse({ status: 200, description: 'User unblocked' })
  unblock(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.blocks.unblock(req.user.id, id);
  }
}