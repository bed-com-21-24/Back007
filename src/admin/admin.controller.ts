import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { RejectProviderDto } from './dto/reject-provider.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('admin')
@UseGuards(AdminAuthGuard)
@ApiTags('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get administrator dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data returned' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users' })
  @ApiResponse({ status: 200, description: 'Users returned' })
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiParam({ name: 'id', description: 'Numeric ID of the user', type: Number })
  @ApiResponse({ status: 200, description: 'User profile updated' })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, dto);
  }

  @Post('admins')
  @ApiOperation({ summary: 'Create another administrator account' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: 'Administrator account created' })
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @Patch('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend a user account' })
  @ApiParam({ name: 'id', description: 'Numeric ID of the user', type: Number })
  @ApiResponse({ status: 200, description: 'User account suspended' })
  suspendUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.suspendUser(id);
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Ban a user account' })
  @ApiParam({ name: 'id', description: 'Numeric ID of the user', type: Number })
  @ApiResponse({ status: 200, description: 'User account banned' })
  banUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.banUser(id);
  }

  @Delete('providers/:id')
  @ApiOperation({ summary: 'Delete a provider listing' })
  @ApiParam({ name: 'id', description: 'Numeric ID of the provider profile', type: Number })
  @ApiResponse({ status: 200, description: 'Provider listing deleted' })
  deleteProvider(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProvider(id);
  }

  @Patch('providers/:id/approve')
  @ApiOperation({ summary: 'Approve a provider listing' })
  @ApiParam({ name: 'id', description: 'Numeric ID of the provider profile', type: Number })
  @ApiResponse({ status: 200, description: 'Provider listing approved' })
  approveProvider(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveProvider(id);
  }

  @Patch('providers/:id/reject')
  @ApiOperation({ summary: 'Reject a provider listing' })
  @ApiParam({ name: 'id', description: 'Numeric ID of the provider profile', type: Number })
  @ApiResponse({ status: 200, description: 'Provider listing rejected' })
  rejectProvider(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectProviderDto,
  ) {
    return this.adminService.rejectProvider(id, dto);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Change a user role' })
  @ApiParam({ name: 'id', description: 'Numeric ID of the user', type: Number })
  @ApiResponse({ status: 200, description: 'User role updated' })
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto);
  }

  @Get('reports/usage')
  @ApiOperation({ summary: 'Get platform usage report' })
  @ApiResponse({ status: 200, description: 'Usage report returned' })
  getUsageReport() {
    return this.adminService.getUsageReport();
  }
}
