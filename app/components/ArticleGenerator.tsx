import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/api';

interface ArticleGeneratorProps {
  keyword: string;
  title: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onError: (error: string) => void;
}

export default function ArticleGenerator({
  keyword,
  title,
  isLoading,
  setIsLoading,
  onError,
}: ArticleGeneratorProps) {
  const [generatedArticle, setGeneratedArticle] = useState<string>('');

  const generateArticle = async () => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth('/api/generate-article', {
        method: 'POST',
        body: JSON.stringify({
          keyword,
          title,
          html: '', // This will be generated on the server
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article');
      }

      // Check if we have article data and content
      if (!data.article || !data.article.html) {
        throw new Error('No article content received');
      }

      // Clean up the content - remove any markdown formatting from the title
      let cleanContent = data.article.html;
      cleanContent = cleanContent.replace(/\*\*/g, ''); // Remove bold markdown
      cleanContent = cleanContent.replace(/\[|\]/g, ''); // Remove square brackets

      setGeneratedArticle(cleanContent);
    } catch (error) {
      console.error('Error:', error);
      onError(error instanceof Error ? error.message : 'Failed to generate article');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={generateArticle}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Generating Article...' : 'Generate Article'}
      </Button>

      {generatedArticle && (
        <div 
          className="prose max-w-none mt-6 p-6 bg-white rounded-lg shadow"
          dangerouslySetInnerHTML={{ __html: generatedArticle }}
        />
      )}

      {isLoading && (
        <div className="text-center py-4">
          <p className="text-gray-600">Generating your article... This may take a few minutes.</p>
        </div>
      )}
    </div>
  );
} 