import { Injectable } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AiProviderInterface,
  AnalysisInput,
  AnalysisResult,
  CommentsAnalysisInput,
  CommentsAnalysisResult,
} from "../interfaces/ai-provider.interface";
import { AnalyticsService } from "../../analytics/analytics.service";

@Injectable()
export class GeminiProvider implements AiProviderInterface {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(private analyticsService: AnalyticsService) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_GEMINI_API_KEY environment variable is required");
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GOOGLE_GEMINI_API_MODEL || "gemma-3n-e4b-it";
  }

  async analyzeText(input: AnalysisInput): Promise<AnalysisResult> {
    const prompt = this.buildPrompt(input.text, input.keywords);

    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);

      const response = result.response;
      const content = response.text();

      // Track token usage
      const usage = response.usageMetadata;
      if (usage) {
        this.analyticsService
          .trackGeminiRequest(
            usage.promptTokenCount || 0,
            usage.candidatesTokenCount || 0,
            this.model,
            input.requestId, // Pass request ID if available
          )
          .catch((error) =>
            console.error("Failed to track Gemini request:", error),
          );
      }

      return this.parseResponse(content, input.keywords);
    } catch (error) {
      console.error("Error analyzing text with Gemini:", error);
      throw new Error("Failed to analyze text with AI provider");
    }
  }

  private buildPrompt(text: string, keywords: string[]): string {
    return `Analyze the following text and determine if there are any offers on buying or describing interest in the specified keywords.

TEXT: "${text}"

KEYWORDS: [${keywords.join(", ")}]

Please provide your analysis in the following JSON format:
{
  "mentioned": boolean,
  "mentionedKeywords": string[],
  "snippet": string,
  "confidence": number,
  "analysis": string
}

Where:
- "mentioned": true if any of the keywords are mentioned in a buying/interest context, false otherwise
- "mentionedKeywords": array of keywords that were actually mentioned in the text
- "snippet": a short excerpt (1-2 sentences) from the text that contains the relevant mention
- "confidence": a number between 0 and 1 indicating confidence in the analysis
- "analysis": a brief explanation of your reasoning

Focus on identifying:
1. Direct requests to buy products/services
2. Expressions of interest in purchasing
3. Descriptions of needs that could lead to purchases
4. Mentions of specific keywords in relevant contexts

Return ONLY the JSON response, no additional text or explanations.`;
  }

  private parseResponse(response: string, keywords: string[]): AnalysisResult {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and sanitize the response
      return {
        mentioned: Boolean(parsed.mentioned),
        mentionedKeywords: Array.isArray(parsed.mentionedKeywords)
          ? parsed.mentionedKeywords.filter((kw: string) =>
              keywords.includes(kw),
            )
          : [],
        snippet: typeof parsed.snippet === "string" ? parsed.snippet : "",
        confidence:
          typeof parsed.confidence === "number"
            ? Math.max(0, Math.min(1, parsed.confidence))
            : 0,
        analysis: typeof parsed.analysis === "string" ? parsed.analysis : "",
      };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return {
        mentioned: false,
        mentionedKeywords: [],
        snippet: "",
        confidence: 0,
        analysis: "Failed to parse AI response",
      };
    }
  }

  async analyzeMultiple(inputs: AnalysisInput[]): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    for (const input of inputs) {
      try {
        const result = await this.analyzeText(input);
        results.push(result);
      } catch (error) {
        console.error("Error analyzing input:", error);
        results.push({
          mentioned: false,
          mentionedKeywords: [],
          snippet: "",
          confidence: 0,
          analysis: "Analysis failed",
        });
      }
    }

    return results;
  }

  async analyzeComments(
    input: CommentsAnalysisInput,
  ): Promise<CommentsAnalysisResult> {
    const prompt = this.buildCommentsPrompt(input.comments, input.keywords);

    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);

      const response = result.response;
      const content = response.text();

      // Track token usage
      const usage = response.usageMetadata;
      if (usage) {
        this.analyticsService
          .trackGeminiRequest(
            usage.promptTokenCount || 0,
            usage.candidatesTokenCount || 0,
            this.model,
          )
          .catch((error) =>
            console.error("Failed to track Gemini request:", error),
          );
      }

      return this.parseCommentsResponse(
        content,
        input.postId,
        input.comments.length,
      );
    } catch (error) {
      console.error("Error analyzing comments with Gemini:", error);
      throw new Error("Failed to analyze comments with AI provider");
    }
  }

  async analyzeMultipleComments(
    inputs: CommentsAnalysisInput[],
  ): Promise<CommentsAnalysisResult[]> {
    const results: CommentsAnalysisResult[] = [];

    for (const input of inputs) {
      try {
        const result = await this.analyzeComments(input);
        results.push(result);
      } catch (error) {
        console.error("Error analyzing comments input:", error);
        results.push({
          postId: input.postId,
          mentioned: false,
          mentionedKeywords: [],
          snippet: "",
          confidence: 0,
          analysis: "Comments analysis failed",
          commentCount: input.comments.length,
          analyzedCommentCount: 0,
        });
      }
    }

    return results;
  }

  private buildCommentsPrompt(comments: string[], keywords: string[]): string {
    const commentsText = comments.slice(0, 50).join("\n\n---\n\n"); // Limit to first 50 comments

    return `Analyze the following comments and determine if there are any offers on buying or describing interest in the specified keywords.

COMMENTS:
"${commentsText}"

KEYWORDS: [${keywords.join(", ")}]

Please provide your analysis in the following JSON format:
{
  "mentioned": boolean,
  "mentionedKeywords": string[],
  "snippet": string,
  "confidence": number,
  "analysis": string
}

Where:
- "mentioned": true if any of the keywords are mentioned in a buying/interest context, false otherwise
- "mentionedKeywords": array of keywords that were actually mentioned in the comments
- "snippet": a short excerpt (1-2 sentences) from the comments that contains the relevant mention
- "confidence": a number between 0 and 1 indicating confidence in the analysis
- "analysis": a brief explanation of your reasoning

Focus on identifying:
1. Direct requests to buy products/services in comments
2. Expressions of interest in purchasing in comments
3. Descriptions of needs that could lead to purchases in comments
4. Mentions of specific keywords in relevant contexts in comments

Return ONLY the JSON response, no additional text or explanations.`;
  }

  private parseCommentsResponse(
    response: string,
    postId: string,
    totalComments: number,
  ): CommentsAnalysisResult {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and sanitize the response
      return {
        postId: postId,
        mentioned: Boolean(parsed.mentioned),
        mentionedKeywords: Array.isArray(parsed.mentionedKeywords)
          ? parsed.mentionedKeywords
          : [],
        snippet: typeof parsed.snippet === "string" ? parsed.snippet : "",
        confidence:
          typeof parsed.confidence === "number"
            ? Math.max(0, Math.min(1, parsed.confidence))
            : 0,
        analysis: typeof parsed.analysis === "string" ? parsed.analysis : "",
        commentCount: totalComments,
        analyzedCommentCount: Math.min(totalComments, 50), // We analyze max 50 comments
      };
    } catch (error) {
      console.error("Error parsing comments AI response:", error);
      return {
        postId: postId,
        mentioned: false,
        mentionedKeywords: [],
        snippet: "",
        confidence: 0,
        analysis: "Failed to parse comments AI response",
        commentCount: totalComments,
        analyzedCommentCount: 0,
      };
    }
  }
}
