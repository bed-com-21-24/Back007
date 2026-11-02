import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { IsString, IsNotEmpty } from 'class-validator';

class AddSkillDto {
  @IsString()
  @IsNotEmpty()
  skill!: string;
}

@Controller('categories')
@ApiTags('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all approved trade categories and their skills' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new trade category (Requires Admin approval)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto.name, dto.skills, false);
  }

  @Patch(':id/skills')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a custom skill to an existing category' })
  addSkill(@Param('id', ParseIntPipe) id: number, @Body() dto: AddSkillDto) {
    return this.categoriesService.addSkill(id, dto.skill);
  }
}