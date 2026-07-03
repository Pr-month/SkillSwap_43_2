import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';

const CITY_ID_EXAMPLE = '123e4567-e89b-12d3-a456-426655440000';

function ApiCityIdParam() {
  return ApiParam({
    name: 'id',
    description: 'ID города',
    type: String,
    format: 'uuid',
    example: CITY_ID_EXAMPLE,
  });
}

export function ApiCitiesGet() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получение списка городов',
      description: 'Возвращает список городов. Доступно без авторизации.',
    }),
    ApiResponse({
      status: 200,
      description: 'Список городов',
      type: [City],
    }),
  );
}

export function ApiCitiesGetOne() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получение города по ID',
      description: 'Возвращает город по UUID. Доступно без авторизации.',
    }),
    ApiCityIdParam(),
    ApiResponse({
      status: 200,
      description: 'Город найден',
      type: City,
    }),
    ApiResponse({ status: 404, description: 'Город не найден' }),
  );
}

export function ApiCitiesCreate() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Создание города',
      description: 'Создаёт новый город. Доступно только администратору.',
    }),
    ApiBody({ type: CreateCityDto }),
    ApiResponse({
      status: 201,
      description: 'Город создан',
      type: City,
    }),
    ApiResponse({ status: 400, description: 'Некорректные данные' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав доступа' }),
    ApiResponse({
      status: 409,
      description: 'Город с таким названием уже существует',
    }),
  );
}

export function ApiCitiesUpdate() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Обновление города',
      description: 'Обновляет данные города. Доступно только администратору.',
    }),
    ApiCityIdParam(),
    ApiBody({ type: UpdateCityDto }),
    ApiResponse({
      status: 200,
      description: 'Город обновлён',
      type: City,
    }),
    ApiResponse({ status: 400, description: 'Некорректные данные' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав доступа' }),
    ApiResponse({ status: 404, description: 'Город не найден' }),
    ApiResponse({
      status: 409,
      description: 'Город с таким названием уже существует',
    }),
  );
}

export function ApiCitiesDelete() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Удаление города',
      description: 'Удаляет город из базы данных. Доступно только администратору.',
    }),
    ApiCityIdParam(),
    ApiResponse({ status: 200, description: 'Город удалён' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав доступа' }),
    ApiResponse({ status: 404, description: 'Город не найден' }),
  );
}
