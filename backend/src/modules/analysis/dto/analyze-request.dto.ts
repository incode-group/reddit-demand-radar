import {
  IsArray,
  IsString,
  IsNotEmpty,
  ArrayMaxSize,
  ArrayMinSize,
  MaxLength,
} from "class-validator";

export class AnalyzeRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  subreddits: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(100, { each: true })
  keywords: string[];
}
