import { Injectable } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiProviderInterface } from "../interfaces/ai-provider.interface";

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

@Injectable()
export class GeminiProvider implements AiProviderInterface {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor() {
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
}
