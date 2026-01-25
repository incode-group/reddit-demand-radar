import { Controller, Get, Query } from "@nestjs/common";
import { KeywordSuggestionsService } from "./keyword-suggestions.service";
import { KeywordSuggestion } from "./keyword-suggestions.service";

@Controller("keyword-suggestions")
export class KeywordSuggestionsController {
  constructor(
    private readonly keywordSuggestionsService: KeywordSuggestionsService,
  ) {}

  @Get()
  async getSuggestions(
    @Query("q") query: string,
  ): Promise<KeywordSuggestion[]> {
    return this.keywordSuggestionsService.getSuggestions(query || "");
  }
}
