import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ArrayMaxSize,
  ArrayUnique,
} from 'class-validator';

export class CreateSkillDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  images?: string[];
}
