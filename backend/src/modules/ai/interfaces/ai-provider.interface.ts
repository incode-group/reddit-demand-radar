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

export interface AIProvider {
  analyzeContent(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
}

export interface AiProviderInterface {
  analyzeText(input: AnalysisInput): Promise<AnalysisResult>;
  analyzeMultiple(inputs: AnalysisInput[]): Promise<AnalysisResult[]>;
}
