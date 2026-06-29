import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export function ApiAuthRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Регистрация нового пользователя' }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({ status: 201, description: 'Пользователь успешно создан' }),
    ApiResponse({ status: 409, description: 'Пользователь уже существует' }),
  );
}

export function ApiAuthLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Вход в аккаунт' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({ status: 200, description: 'Успешная авторизация' }),
    ApiResponse({ status: 401, description: 'Неверные данные' }),
  );
}

export function ApiAuthLogout() {
  return applyDecorators(
    ApiOperation({ summary: 'Выход из аккаунта' }),
    ApiResponse({ status: 200, description: 'Успешный выход' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
  );
}

export function ApiAuthRefresh() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновление токенов' }),
    ApiResponse({ status: 200, description: 'Токены обновлены' }),
    ApiResponse({ status: 401, description: 'Невалидный refresh токен' }),
  );
}
