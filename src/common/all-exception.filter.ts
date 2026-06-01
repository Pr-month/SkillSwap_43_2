import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof EntityNotFoundError) {
      return response.status(HttpStatus.NOT_FOUND).json({
        message: 'Entity not found',
      });
    }

    if (exception.code === '23505') {
      return response.status(HttpStatus.CONFLICT).json({
        message: 'Duplicate entity',
      });
    }

    if (exception instanceof PayloadTooLargeException) {
      return response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        message: 'File too large',
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
    });
  }
}
