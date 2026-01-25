import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  databaseUrl: process.env.DATABASE_URL ?? '',
  aiProvider: (process.env.AI_PROVIDER ?? 'openai') as 'openai' | 'gemini',
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
  },
  redditSubredditNameSearchApiUrl:
    process.env.REDDIT_SUBREDDIT_NAME_SEARCH_API_URL ??
    'https://www.reddit.com/api/search_reddit_names.json',
}));

