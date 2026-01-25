import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { RedditService } from './reddit.service';

@Controller('reddit')
export class RedditController {
  constructor(private readonly redditService: RedditService) {}

  @Get('subreddits/search')
  async searchSubreddits(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      return { suggestions: [] };
    }

    const suggestions = await this.redditService.searchSubreddits(query);
    return { suggestions };
  }
}
