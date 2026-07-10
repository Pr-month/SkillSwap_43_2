import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCategoriesGet() {
  return applyDecorators(
    ApiOperation({ summary: 'Получение списка категорий' }),
    ApiResponse({ status: 200, description: 'Список категорий' }),
  );
}

export function ApiCategoriesCreate() {
  return applyDecorators(
    ApiOperation({ summary: 'Создание категории' }),
    ApiResponse({ status: 201, description: 'Категория создана' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав доступа' }),
  );
}

export function ApiCategoriesUpdate() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновление категории' }),
    ApiResponse({ status: 200, description: 'Категория обновлена' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав доступа' }),
    ApiResponse({ status: 404, description: 'Категория не найдена' }),
  );
}

export function ApiCategoriesDelete() {
  return applyDecorators(
    ApiOperation({ summary: 'Удаление категории' }),
    ApiResponse({ status: 200, description: 'Категория удалена' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав доступа' }),
    ApiResponse({ status: 404, description: 'Категория не найдена' }),
  );
}
