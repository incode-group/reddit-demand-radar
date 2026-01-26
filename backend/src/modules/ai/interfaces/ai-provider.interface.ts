export interface AIAnalysisRequest {
  subreddits: string[];
  keywords: string[];
  content: string;
}

export interface AIAnalysisResponse {
  relevance: number;
  sentiment: "positive" | "neutral" | "negative";
  summary: string;
  keyPoints: string[];
}

export interface AnalysisInput {
  text: string;
  keywords: string[];
}

export interface AnalysisResult {
  mentioned: boolean;
  mentionedKeywords: string[];
  snippet: string;
  confidence: number;
  analysis: string;
}

export interface CommentsAnalysisInput {
  postId: string;
  comments: string[];
  keywords: string[];
}

export interface CommentsAnalysisResult {
  postId: string;
  mentioned: boolean;
  mentionedKeywords: string[];
  snippet: string;
  confidence: number;
  analysis: string;
  commentCount: number;
  analyzedCommentCount: number;
}

export interface AIProvider {
  analyzeContent(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
}

export interface AiProviderInterface {
  analyzeText(input: AnalysisInput): Promise<AnalysisResult>;
  analyzeMultiple(inputs: AnalysisInput[]): Promise<AnalysisResult[]>;
}
