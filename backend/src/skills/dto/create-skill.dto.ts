import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ArrayMaxSize,
  ArrayUnique,
} from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Название навыка',
    example: 'Игра на акустической гитаре',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Описание навыка',
    example:
      'Обучаю игре в технике фингерстайл. Это техника игры, при которой звук извлекается пальцами правой руки без использования медиатора. Она позволяет одновременно исполнять мелодию, аккомпанемент, басовую линию и даже перкуссионные элементы.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Id категории, к которой относится навык',
    example: '123e4567-e89b-12d3-a456-426655440000',
  })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Фото, иллюстрирующие процесс обучения навыку',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  images?: string[];
}
