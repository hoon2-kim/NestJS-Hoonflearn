import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * e2e용 데이터베이스
 */
export const testTypeOrmModuleConfig = {
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
    synchronize: true,
    autoLoadEntities: true,
    logging: false,
    dropSchema: true,
  }),
  inject: [ConfigService],
};
