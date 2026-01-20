import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './definitions/app.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}

