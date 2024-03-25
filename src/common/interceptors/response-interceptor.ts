import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class IResponse<T> {
  ok: boolean;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        console.log(Array.isArray(data));

        if (data?.data) {
          return {
            ok: true,
            ...data,
          };
        }

        return {
          ok: true,
          data,
        };
      }),
    );
  }
}
