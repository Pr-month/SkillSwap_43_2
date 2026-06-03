import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import {
  GetSkillsDto,
  FilteredSkillsWithPagination,
} from '../skills/dto/get-skills.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IAuthorizedRequest } from '../auth/auth.types';
import { Skill } from './entities/skill.entity';

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
}
