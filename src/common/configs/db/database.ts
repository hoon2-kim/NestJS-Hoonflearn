import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmModuleConfig = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + './../**/**.entity{.ts,.js}'],
    // synchronize: configService.get('NODE_ENV') === 'development',
    synchronize: true,
    autoLoadEntities: true,
    logging: configService.get('NODE_ENV') === 'development',
  }),
  inject: [ConfigService],
};
