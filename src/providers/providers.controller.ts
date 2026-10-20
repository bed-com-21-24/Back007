import {
  Controller,
  Post,
  Get,
  Patch,
  Put,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateProviderSkillsDto } from './dto/update-provider-skills.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

type AuthenticatedRequest = Request & {
  user?: {
    id?: number;
    sub?: number;
  };
};

@Controller('providers')
@UseGuards(AuthGuard('jwt'))
@ApiTags('providers')
@ApiBearerAuth()
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  private getUserId(req: AuthenticatedRequest): number {
    const userId = req.user?.id ?? req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user ID not found');
    }
    return userId;
  }

  @Post()
  @ApiOperation({ summary: 'Create the current user provider listing' })
  @ApiResponse({ status: 201, description: 'Provider listing created' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProviderDto,
  ) {
    return this.providersService.create(this.getUserId(req), dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current user provider listing' })
  @ApiResponse({ status: 200, description: 'Provider listing returned' })
  findMe(@Req() req: AuthenticatedRequest) {
    return this.providersService.findMe(this.getUserId(req));
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the current user provider listing' })
  @ApiResponse({ status: 200, description: 'Provider listing updated' })
  updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.providersService.updateMe(this.getUserId(req), dto);
  }

  @Put('me/skills')
  @ApiOperation({ summary: 'Replace the current provider skills' })
  @ApiResponse({ status: 200, description: 'Provider skills updated' })
  updateSkills(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProviderSkillsDto,
  ) {
    return this.providersService.updateSkills(this.getUserId(req), dto);
  }
}