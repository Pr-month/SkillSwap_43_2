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
  Param,
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

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

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
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Req() req: IAuthorizedRequest,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(id, req.user.sub, updateSkillDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: IAuthorizedRequest,
  ): Promise<void> {
    return this.skillsService.remove(id, req.user.sub);
  }

  @Patch('fsvorites/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Req()
    req: IAuthorizedRequest & {
      user: {
        sub: string;
      };
    },
  ) {
    return this.skillsService.favoriteSkill(id, req.user.sub);
  }
}
