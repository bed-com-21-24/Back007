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
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProvidersService } from './providers.service';
import { ProviderDiscoveryService } from './provider-discovery.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateProviderSkillsDto } from './dto/update-provider-skills.dto';
import { SearchProvidersDto } from './dto/search-providers.dto';

type AuthenticatedRequest = Request & { user?: { id?: number; sub?: number } };

@Controller('providers')
@ApiTags('providers')
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly discoveryService: ProviderDiscoveryService,
  ) {}

  private getUserId(req: AuthenticatedRequest): number {
    const userId = req.user?.id ?? req.user?.sub;
    if (!userId) throw new UnauthorizedException('Authenticated user ID not found');
    return userId;
  }

  // PUBLIC DISCOVERY
  @Get()
  @ApiOperation({ summary: 'Search, filter and sort approved service providers' })
  search(@Query() query: SearchProvidersDto) {
    return this.discoveryService.search(query);
  }

    @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user provider listing' })
  findMe(@Req() req: AuthenticatedRequest) {
    return this.providersService.findMe(this.getUserId(req));
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get the public profile of one provider' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discoveryService.findOne(id);
  }

  // AUTHENTICATED ROUTES
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create the current user provider listing' })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateProviderDto) {
    return this.providersService.create(this.getUserId(req), dto);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the current user provider listing' })
  updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProviderDto) {
    return this.providersService.updateMe(this.getUserId(req), dto);
  }

  @Put('me/skills')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Replace the current provider skills' })
  updateSkills(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProviderSkillsDto) {
    return this.providersService.updateSkills(this.getUserId(req), dto);
  }
}