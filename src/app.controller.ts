import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get the API welcome message' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Name to use in the welcome message',
    example: 'Alex',
  })
  @ApiResponse({ status: 200, description: 'Welcome message returned' })
  getHello(@Query('name') name?: string): string {
    return this.appService.getHello(name);
  }
}