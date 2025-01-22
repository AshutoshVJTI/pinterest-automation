import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeywordSelector } from '@/components/KeywordSelector';
import TitleGenerator from '@/components/TitleGenerator';
import ArticleGenerator from '@/components/ArticleGenerator';

interface GenerateArticlesProps {
  selectedKeyword: string;
  generatedTitles: string[];
  selectedTitle: string;
  isLoading: boolean;
  error: string | null;
  setIsLoading: (loading: boolean) => void;
  handleKeywordSelected: (keyword: string) => void;
  handleTitlesGenerated: (titles: string[]) => void;
  handleTitleSelected: (title: string) => void;
  handleError: (error: string) => void;
}

export function GenerateArticles({
  selectedKeyword,
  generatedTitles,
  selectedTitle,
  isLoading,
  error,
  setIsLoading,
  handleKeywordSelected,
  handleTitlesGenerated,
  handleTitleSelected,
  handleError
}: GenerateArticlesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New Article</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Step 1: Select Topic</h2>
            <KeywordSelector 
              selectedKeyword={selectedKeyword}
              onKeywordsSelected={handleKeywordSelected}
              isLoading={isLoading}
            />
          </div>

          {selectedKeyword && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Step 2: Generate Titles</h2>
              <TitleGenerator 
                keyword={selectedKeyword}
                onTitlesGenerated={handleTitlesGenerated}
                onTitleSelected={handleTitleSelected}
                generatedTitles={generatedTitles}
                selectedTitle={selectedTitle}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onError={handleError}
              />
            </div>
          )}

          {selectedTitle && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Step 3: Generate Article</h2>
              <ArticleGenerator 
                keyword={selectedKeyword}
                title={selectedTitle}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onError={handleError}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 