import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SearchProvidersDto } from './dto/search-providers.dto';
import { ProviderDiscoveryService } from './provider-discovery.service';

@Controller('providers')
@ApiTags('provider discovery')
export class ProviderDiscoveryController {
  constructor(private readonly discoveryService: ProviderDiscoveryService) {}

  @Get()
  @ApiOperation({
    summary: 'Search, filter and sort approved service providers',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of providers' })
  @ApiResponse({ status: 400, description: 'Invalid search options' })
  search(@Query() query: SearchProvidersDto) {
    return this.discoveryService.search(query);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'List the trade categories that have approved providers',
  })
  @ApiResponse({ status: 200, description: 'Categories with provider counts' })
  listCategories() {
    return this.discoveryService.listCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get the public profile of one provider' })
  @ApiParam({
    name: 'id',
    description: 'Numeric ID of the provider',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Provider profile' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discoveryService.findOne(id);
  }
}