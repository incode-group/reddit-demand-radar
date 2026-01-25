import { Module } from "@nestjs/common";
import { KeywordSuggestionsService } from "./keyword-suggestions.service";
import { RedisModule } from "../redis/redis.module";
import { KeywordSuggestionsController } from "./keyword-suggestions.controller";

@Module({
  imports: [RedisModule],
  providers: [KeywordSuggestionsService],
  controllers: [KeywordSuggestionsController],
  exports: [KeywordSuggestionsService],
})
export class KeywordSuggestionsModule {}
