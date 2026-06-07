import { Controller, Post, UseGuards, Req, Body, Get, Query, Param, Patch, Delete } from '@nestjs/common';
import { IAuthorizedRequest } from 'src/auth/auth.types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateSkillDto } from './dto/create-skill.dto';
import { GetSkillsDto, FilteredSkillsWithPagination } from './dto/get-skills.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: IAuthorizedRequest,
    @Body() createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    return this.skillsService.create(req.user.sub, createSkillDto);
  }

  @Get()
  async findAll(
    @Query() getSkillsDto: GetSkillsDto,
  ): Promise<FilteredSkillsWithPagination> {
    return this.skillsService.findAll(getSkillsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // return this.skillsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    // return this.skillsService.update(+id, updateSkillDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: IAuthorizedRequest,
  ): Promise<void> {
    return this.skillsService.remove(id, req.user.sub);
  }
}

