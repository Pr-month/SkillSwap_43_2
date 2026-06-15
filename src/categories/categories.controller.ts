import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { Roles } from 'src/users/users.enums';
import {
  ApiCategoriesGet,
  ApiCategoriesCreate,
  ApiCategoriesUpdate,
  ApiCategoriesDelete,
} from './categories.swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiCategoriesGet()
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(Roles.ADMIN)
  @ApiCategoriesCreate()
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(Roles.ADMIN)
  @ApiCategoriesUpdate()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(Roles.ADMIN)
  @ApiCategoriesDelete()
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
