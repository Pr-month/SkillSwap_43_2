import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Modes } from '../skills.enums';
import { Gender } from '../../users/users.enums';

export class GetSkillsDto {
  @IsOptional()
  @IsUUID()
  @IsString()
  cursor?: string;

  @Type(() => Number)
  @IsInt()
  limit: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsEnum(Modes)
  mode?: Modes;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  location?: string;
}

export type FilteredSkillsWithPagination = {
  data: {
    user: {
      id: string;
      name: string;
      wantToLearn: string[];
      city: string;
      birthdate: string;
      avatar: string | null;
    };
    skill: {
      title: string;
      category: string;
    };
  }[];
  hasNextPage: boolean;
  nextCursor: string;
};
