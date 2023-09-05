import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
  implements ExceptionFilter
{
  private readonly logger = new Logger(HttpExceptionFilter.name);

  // catch(exception: T, host: ArgumentsHost) {
  //   const ctx = host.switchToHttp();
  //   const response = ctx.getResponse<Response>();
  //   const status = exception.getStatus();
  //   const error = exception.getResponse() as
  //     | string
  //     | { error: string; statusCode: number; message: string[] };

  //   this.logger.error(`Status ${status} Error: ${JSON.stringify(error)}`);

  //   if (typeof error === 'string') {
  //     response.status(status).json({
  //       statusCode: status,
  //       timestamp: new Date().toLocaleString('ko-KR', {
  //         timeZone: 'Asia/Seoul',
  //       }),
  //       message: error,
  //     });
  //   } else {
  //     response.status(status).json({
  //       ...error,
  //       timestamp: new Date().toLocaleString('ko-KR', {
  //         timeZone: 'Asia/Seoul',
  //       }),
  //     });
  //   }
  // }
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const msg =
      exception instanceof HttpException ? exception.getResponse() : exception;

    this.logger.error(`Status ${status} Error: ${JSON.stringify(msg)}`);

    response.status(status).json({
      time: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      path: request.url,
      error: msg,
    });
  }
}
