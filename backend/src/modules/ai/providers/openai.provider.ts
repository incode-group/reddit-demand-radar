import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import {
  AIProvider,
  AIAnalysisRequest,
  AIAnalysisResponse,
  AiProviderInterface,
  AnalysisInput,
  AnalysisResult,
} from "../interfaces/ai-provider.interface";

@Injectable()
export class OpenAIProvider implements AIProvider, AiProviderInterface {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    // const apiKey = this.configService.get<string>("app.openai.apiKey");
    // if (!apiKey) {
    //   throw new Error("OpenAI API key not configured");
    // }
    // this.openai = new OpenAI({ apiKey });
  }

  async analyzeContent(
    request: AIAnalysisRequest,
  ): Promise<AIAnalysisResponse> {
    // Placeholder implementation - will integrate OpenAI API later
    const apiKey = this.configService.get<string>("app.openai.apiKey");

    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Mock response for MVP
    return {
      relevance: Math.floor(Math.random() * 20) + 80,
      sentiment: "positive",
      summary: "Mock analysis summary - OpenAI integration pending",
      keyPoints: ["Mock key point 1", "Mock key point 2", "Mock key point 3"],
    };
  }

  async analyzeText(input: AnalysisInput): Promise<AnalysisResult> {
    const prompt = this.buildPrompt(input.text, input.keywords);

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that analyzes text for keyword mentions and buying intent.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const content = response.choices[0].message.content;

      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      return this.parseResponse(content, input.keywords);
    } catch (error) {
      console.error("Error analyzing text with OpenAI:", error);
      throw new Error("Failed to analyze text with AI provider");
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
}
