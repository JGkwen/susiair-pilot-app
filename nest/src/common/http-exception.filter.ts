import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const isHttpError = exception instanceof HttpException;
    const statusCode = isHttpError
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!isHttpError) {
      this.logger.error(exception);
    }

    http
      .getResponse<Response>()
      .status(statusCode)
      .json({
        statusCode,
        error: STATUS_CODES[statusCode] ?? 'Error',
        message: isHttpError ? messageOf(exception) : 'Internal server error',
        path: http.getRequest<Request>().url,
        timestamp: new Date().toISOString(),
      });
  }
}

function messageOf(exception: HttpException): string | string[] {
  const body = exception.getResponse();
  return typeof body === 'object' && 'message' in body
    ? (body as { message: string | string[] }).message
    : exception.message;
}
