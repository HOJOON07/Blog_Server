import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  ENV_DB_DATABASE,
  ENV_DB_PASSWORD,
  ENV_DB_PORT,
  ENV_DB_USERNAME,
  ENV_HOST,
} from '../const/env-keys.const';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>(ENV_HOST),
  port: configService.get<number>(ENV_DB_PORT),
  username: configService.get<string>(ENV_DB_USERNAME),
  password: configService.get<string>(ENV_DB_PASSWORD),
  database: configService.get<string>(ENV_DB_DATABASE),

  synchronize: true,
});
