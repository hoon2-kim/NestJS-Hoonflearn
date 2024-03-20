import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Hoonflearn-server')
    .setDescription('NestJS-REST-API-개인 프로젝트')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        // bearerFormat: 'JWT',
        scheme: 'Bearer',
        name: 'JWT',
        description: '로그인 후 JWT - AccessToken 입력',
        in: 'header',
      },
      'access_token',
    )
    // .addBearerAuth({})
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [PageMetaDto],
  });
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });
}
