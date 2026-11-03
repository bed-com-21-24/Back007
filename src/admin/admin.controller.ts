import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ProviderActionDto } from './dto/provider-action.dto';
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

  @Get('overview')
  @ApiOperation({
    summary: 'Get dashboard, users, platform report, and reported users',
  })
  @ApiResponse({ status: 200, description: 'Administrator overview returned' })
  getOverview() {
    return this.adminService.getOverview();
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiParam({ name: 'id', description: 'Numeric ID of the user', type: Number })
  @ApiResponse({ status: 200, description: 'User profile updated' })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.adminService.updateUser(id, dto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Change a user account status' })
  @ApiParam({ name: 'id', description: 'Numeric ID of the user', type: Number })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiResponse({ status: 200, description: 'User account status updated' })
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto);
  }

  @Post('admins')
  @ApiOperation({ summary: 'Create another administrator account' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: 'Administrator account created' })
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @Patch('providers/:id/action')
  @ApiOperation({ summary: 'Approve, reject, or delete a provider listing' })
  @ApiParam({
    name: 'id',
    description: 'Numeric ID of the provider profile',
    type: Number,
  })
  @ApiBody({ type: ProviderActionDto })
  @ApiResponse({ status: 200, description: 'Provider action completed' })
  providerAction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProviderActionDto,
  ) {
    return this.adminService.providerAction(id, dto);
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
}
