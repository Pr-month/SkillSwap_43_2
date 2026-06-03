import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import {
  GetSkillsDto,
  FilteredSkillsWithPagination,
} from '../skills/dto/get-skills.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll(
    @Query() getSkillsDto: GetSkillsDto,
  ): Promise<FilteredSkillsWithPagination> {
    return this.skillsService.findAll(getSkillsDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.skillsService.remove(id);
  }
}
