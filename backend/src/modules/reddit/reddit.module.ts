import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';
import { RedditController } from './reddit.controller';
import { RedditService } from './reddit.service';

@Module({
  imports: [ConfigModule, RedisModule],
  controllers: [RedditController],
  providers: [RedditService],
  exports: [RedditService],
})
export class RedditModule {}
