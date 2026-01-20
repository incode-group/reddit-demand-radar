import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';

export class AnalyzeRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  subreddits: string[];

  @IsNotEmpty()
  @IsString()
  keywords: string;
}
