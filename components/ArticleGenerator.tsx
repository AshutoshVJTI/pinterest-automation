"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useArticles } from '@/hooks/useArticles';
import { getAuth } from 'firebase/auth';

interface GeneratedArticle {
  title: string;
  html: string;
  coverImage: string;
  images: string[];
}

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
  onError 
}: ArticleGeneratorProps) {
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const { saveArticle } = useArticles();

  const generateArticle = async () => {
    if (!title) return;
    setIsLoading(true);

    // Retrieve the current user's token from Firebase
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      onError("User not authenticated");
      setIsLoading(false);
      return;
    }
    const token = await user.getIdToken(true);

    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include the Firebase token in the Authorization header
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ keyword, title }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article');
      }

      if (!data.article?.content) {
        throw new Error('No article content received');
      }

      await saveArticle({
        title,
        keyword,
        html: data.article.html,
        coverImage: data.article.coverImage,
        images: data.article.images,
      });

      setArticle(data.article);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to generate article');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Button
        onClick={generateArticle}
        disabled={isLoading}
        className="w-full md:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Article...
          </>
        ) : (
          'Generate Article'
        )}
      </Button>

      {article && (
        <div className="space-y-8 max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          {/* Cover Image */}
          <img 
            src={article.coverImage} 
            alt="Cover" 
            className="w-full h-[400px] object-cover rounded-lg shadow-lg"
          />

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.html }}
          />
        </div>
      )}
    </div>
  );
}
