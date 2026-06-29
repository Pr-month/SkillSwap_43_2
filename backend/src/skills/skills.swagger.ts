import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateSkillDto } from './dto/create-skill.dto';
import { GetSkillsDto } from './dto/get-skills.dto';
import { Skill } from './entities/skill.entity';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { User } from '../users/entities/user.entity';

export function ApiSkillsCreate() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Создание нового навыка' }),
    ApiBody({ type: CreateSkillDto }),
    ApiResponse({
      status: 201,
      description: 'Навык успешно создан.',
      type: Skill,
    }),
    ApiResponse({ status: 400, description: 'Некорректные данные.' }),
  );
}

export function ApiSkillsFindAll() {
  return applyDecorators(
    ApiOperation({ summary: 'Получение всех навыков' }),
    ApiQuery({ type: GetSkillsDto }),
    ApiResponse({
      status: 200,
      description: 'Навыки успешно получены',
    }),
    ApiResponse({ status: 404, description: 'Данные не найдены' }),
    ApiResponse({ status: 400, description: 'Некорректные данные.' }),
  );
}

export function ApiSkillsUpdate() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Обновление данных навыка' }),
    ApiParam({ name: 'id', description: 'ID навыка', type: String }),
    ApiBody({ type: UpdateSkillDto }),
    ApiResponse({
      status: 200,
      description: 'Навык успешно обновлен.',
      type: Skill,
    }),
    ApiResponse({ status: 404, description: 'Данные не найдены' }),
    ApiResponse({ status: 400, description: 'Некорректные данные.' }),
  );
}

export function ApiSkillsDelete() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Удаление навыка' }),
    ApiParam({ name: 'id', description: 'ID навыка', type: String }),
    ApiResponse({
      status: 204,
      description: 'Навык успешно удален.',
    }),
    ApiResponse({ status: 404, description: 'Данные не найдены' }),
    ApiResponse({ status: 400, description: 'Некорректные данные.' }),
  );
}

export function ApiSkillsAddToFavorites() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Добавление навыка в избранное' }),
    ApiParam({ name: 'id', description: 'ID навыка', type: String }),
    ApiResponse({
      status: 200,
      description: 'Навык успешно добавлен в избранное.',
      type: User,
    }),
    ApiResponse({ status: 404, description: 'Данные не найдены' }),
    ApiResponse({ status: 400, description: 'Некорректные данные.' }),
  );
}

export function ApiSkillsDeleteFromFavorites() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Удаление навыка из избранного' }),
    ApiParam({ name: 'id', description: 'ID навыка', type: String }),
    ApiResponse({
      status: 200,
      description: 'Навык успешно удален из избранного.',
      type: User,
    }),
    ApiResponse({ status: 404, description: 'Данные не найдены' }),
    ApiResponse({ status: 400, description: 'Некорректные данные.' }),
  );
}

export function ApiSkillsGetSimilar() {
  return applyDecorators(
    ApiOperation({ summary: 'Получение похожих навыков' }),
    ApiParam({ name: 'id', description: 'ID навыка', type: String }),
    ApiResponse({
      status: 200,
      description: 'Получены похожие навыки.',
      type: [User],
    }),
    ApiResponse({ status: 404, description: 'Данные не найдены' }),
    ApiResponse({ status: 400, description: 'Некорректные данные.' }),
  );
}
