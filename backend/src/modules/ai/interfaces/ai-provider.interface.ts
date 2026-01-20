export interface AIAnalysisRequest {
  subreddits: string[];
  keywords: string[];
  content: string;
}

export interface AIAnalysisResponse {
  relevance: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  keyPoints: string[];
}

export interface AIProvider {
  analyzeContent(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
}
