import {
  Controller,
  Post,
  Get,
  Patch,
  Put,
  Param,
  ParseIntPipe,
  Body,
  Req,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateProviderSkillsDto } from './dto/update-provider-skills.dto';
import { SearchProvidersDto } from './dto/search-providers.dto';
import { CreateProviderReviewDto } from './dto/create-provider-review.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
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

  @Get()
  @ApiOperation({ summary: 'List approved provider profiles' })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Search names, bios, and skills',
  })
  @ApiQuery({
    name: 'skill',
    required: false,
    description: 'Filter by skill or product/service keyword',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiResponse({ status: 200, description: 'Provider profiles returned' })
  findAll(@Query() filters: SearchProvidersDto) {
    return this.providersService.findAll(filters);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'List provider reviews and rating summary' })
  @ApiResponse({
    status: 200,
    description: 'Reviews and average rating returned',
  })
  getReviews(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.getReviews(id);
  }

  @Post(':id/reviews')
  @ApiOperation({ summary: 'Rate and optionally review a provider' })
  @ApiResponse({ status: 201, description: 'Provider review submitted' })
  createReview(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProviderReviewDto,
  ) {
    return this.providersService.createReview(id, this.getUserId(req), dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create the current user provider listing' })
  @ApiResponse({ status: 201, description: 'Provider listing created' })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateProviderDto) {
    return this.providersService.create(this.getUserId(req), dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current user provider listing' })
  @ApiResponse({ status: 200, description: 'Provider listing returned' })
  findMe(@Req() req: AuthenticatedRequest) {
    return this.providersService.findMe(this.getUserId(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an approved provider profile' })
  @ApiResponse({ status: 200, description: 'Provider profile returned' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.findOne(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the current user provider listing' })
  @ApiResponse({ status: 200, description: 'Provider listing updated' })
  updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProviderDto) {
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
