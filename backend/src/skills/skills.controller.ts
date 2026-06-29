import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import {
  GetSkillsDto,
  FilteredSkillsWithPagination,
} from './dto/get-skills.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IAuthorizedRequest } from '../auth/auth.types';
import { Skill } from './entities/skill.entity';
import { SkillsService } from './skills.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiSkillsCreate,
  ApiSkillsFindAll,
  ApiSkillsUpdate,
  ApiSkillsDelete,
  ApiSkillsAddToFavorites,
  ApiSkillsDeleteFromFavorites,
  ApiSkillsGetSimilar,
} from './skills.swagger';

@ApiTags('users')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @ApiSkillsCreate()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: IAuthorizedRequest,
    @Body() createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    return this.skillsService.create(req.user.sub, createSkillDto);
  }

  @Get()
  @ApiSkillsFindAll()
  async findAll(
    @Query() getSkillsDto: GetSkillsDto,
  ): Promise<FilteredSkillsWithPagination> {
    return this.skillsService.findAll(getSkillsDto);
  }

  // после написания эндпойнта добавить декораторы для сваггера
  @Get(':id')
  findOne(@Param('id') _id: string) {
    // return this.skillsService.findOne(+id);
  }

  @Patch(':id')
  @ApiSkillsUpdate()
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Req() req: IAuthorizedRequest,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(id, req.user.sub, updateSkillDto);
  }

  @Delete(':id')
  @ApiSkillsDelete()
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: IAuthorizedRequest,
  ): Promise<void> {
    return this.skillsService.remove(id, req.user.sub);
  }

  @Patch('favorites/:id')
  @ApiSkillsAddToFavorites()
  @UseGuards(JwtAuthGuard)
  addToFavorites(@Param('id') id: string, @Req() req: IAuthorizedRequest) {
    return this.skillsService.favoriteSkill(id, req.user.sub);
  }

  @Get(':id/similar')
  @ApiSkillsGetSimilar()
  getSimilar(@Param('id') id: string) {
    return this.skillsService.getSimilar(id);
  }

  @Delete('favorites/:id')
  @ApiSkillsDeleteFromFavorites()
  @UseGuards(JwtAuthGuard)
  unfavoriteSkill(
    @Param('id') id: string,
    @Req()
    req: IAuthorizedRequest,
  ) {
    return this.skillsService.unfavoriteSkill(id, req.user.sub);
  }
}
