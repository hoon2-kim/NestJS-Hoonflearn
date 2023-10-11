import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { IncomingWebhook } from '@slack/webhook';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
  implements ExceptionFilter
{
  private readonly logger = new Logger(HttpExceptionFilter.name);

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

    const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK);

    if (status >= 500) {
      /** Sentry 알림 */
      Sentry.captureException(exception);
      /** Slack 알림 */
      webhook.send({
        attachments: [
          {
            color: 'danger',
            fields: [
              {
                title: '🚨Hoonflaern SERVER 에러 발생🚨',
                value: exception.stack,
                short: false,
              },
            ],
            ts: Math.floor(new Date().getTime() / 1000).toString(),
          },
        ],
      });
    }

    return response.status(status).json({
      time: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      path: request.url,
      error: msg,
    });
  }
}
