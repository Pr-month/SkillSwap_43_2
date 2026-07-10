import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
    description:
      'Id последнего навыка в предыдущей порции полученных навыков. Для первого запроса не указывается',
    example: '123e4567-e89b-12d3-a456-426655440000',
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description:
      'Лимит получаемых навыков. По умолчанию отправляется 20 навыков',
    example: '20',
  })
  @Type(() => Number)
  @IsInt()
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Ключевое слово для поиска навыков в базе',
    example: 'английский',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Id категорий для поиска навыков',
    example: [
      '123e4567-e89b-12d3-a456-426655440000',
      '123e4567-e89b-12d3-a456-426655440001',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    description: `Режим поиска навыков. Возможные значения: all - поиск по всем навыкам, wantToLearn - поиск по навыкам в категории "хочу научиться", canTeach - поиск по навыкам в категории "могу научить"`,
    example: 'wantToLearn',
  })
  @IsOptional()
  @IsEnum(Modes)
  mode?: Modes;

  @ApiPropertyOptional({
    description:
      'Пол пользователя для поиска навыков в базе. Возможные значения: male - мужской, female - женский, unknown, - не имеет значения',
    example: 'female',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description:
      'Локация пользователя (город, деревня, село) для поиска навыков в базе',
    example: 'Москва',
  })
  @IsOptional()
  @IsString()
  location?: string;
}

export type FilteredSkillsWithPagination = {
  data: {
    user: {
      id: string;
      name: string;
      wantToLearn: {
        id: string;
        name: string;
      }[];
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
