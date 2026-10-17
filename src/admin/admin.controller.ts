import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { RejectProviderDto } from './dto/reject-provider.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/suspend')
  suspendUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.suspendUser(id);
  }

  @Patch('users/:id/ban')
  banUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.banUser(id);
  }

  @Delete('providers/:id')
  deleteProvider(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProvider(id);
  }

  @Patch('providers/:id/approve')
  approveProvider(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveProvider(id);
  }

  @Patch('providers/:id/reject')
  rejectProvider(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectProviderDto,
  ) {
    return this.adminService.rejectProvider(id, dto);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto);
  }

  @Get('reports/usage')
  getUsageReport() {
    return this.adminService.getUsageReport();
  }
}
