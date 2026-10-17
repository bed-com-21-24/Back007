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

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    sub?: string;
  };
};

@Controller('providers')
@UseGuards(AuthGuard('jwt'))
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
  ) {}

  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.id ?? req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException(
        'Authenticated user ID not found',
      );
    }

    return userId;
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProviderDto,
  ) {
    return this.providersService.create(
      this.getUserId(req),
      dto,
    );
  }

  @Get('me')
  findMe(@Req() req: AuthenticatedRequest) {
    return this.providersService.findMe(
      this.getUserId(req),
    );
  }

  @Patch('me')
  updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.providersService.updateMe(
      this.getUserId(req),
      dto,
    );
  }

  @Put('me/skills')
  updateSkills(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProviderSkillsDto,
  ) {
    return this.providersService.updateSkills(
      this.getUserId(req),
      dto,
    );
  }
}