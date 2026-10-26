import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

type AuthenticatedRequest = Request & { user?: { id?: number; sub?: number } };

@Controller('providers/:providerId/reviews')
@ApiTags('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a rating and review for a provider' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  create(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() dto: CreateReviewDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id ?? req.user?.sub;
    if (!userId) throw new Error('User ID not found in token');
    return this.reviewsService.create(userId, providerId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews for a provider' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  findAll(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.reviewsService.findForProvider(providerId);
  }
}