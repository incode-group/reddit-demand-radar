import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { AIModule } from './modules/ai/ai.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    AppConfigModule,
    PrismaModule,
    AIModule,
    AnalysisModule,
  ],
})
export class AppModule {}

