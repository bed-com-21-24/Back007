import { Body, Controller, Delete, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
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
@ApiOperation({ summary: 'Report a user, optionally blocking them too' })
@ApiResponse({ status: 201, description: 'Report saved. "blocked" says whether a block was applied' })
@ApiResponse({ status: 409, description: 'You already have a pending report against this user' })
async report(
  @Req() req: any,
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: ReportUserDto,
) {
  const report = await this.reports.create(req.user.id, id, dto);
  if (dto.alsoBlock) await this.blocks.block(req.user.id, id);
  return { report, blocked: dto.alsoBlock === true };
}

  @Post(':id/block')
  @ApiOperation({ summary: 'Block a user' })
  @ApiParam({ name: 'id', description: 'Numeric ID of the user to block', type: Number })
  @ApiResponse({ status: 201, description: 'User blocked' })
  block(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.blocks.block(req.user.id, id);
  }

  @Delete(':id/block')
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiParam({ name: 'id', description: 'Numeric ID of the user to unblock', type: Number })
  @ApiResponse({ status: 200, description: 'User unblocked' })
  unblock(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.blocks.unblock(req.user.id, id);
  }
}