import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useArticles } from '../../context/ArticlesContext';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from "lucide-react";
import { Article } from '@/types/article';
import { useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';

export default function ArticlesList() {
  const { articles = [], setArticles, isLoading, setIsLoading, hasLoaded, setHasLoaded } = useArticles();

  useEffect(() => {
    async function fetchArticles() {
      if (!hasLoaded && !isLoading) {
        try {
          setIsLoading(true);
          const response = await fetchWithAuth('/api/articles');
          const { articles: fetchedArticles } = await response.json();
          setArticles(Array.isArray(fetchedArticles) ? fetchedArticles : []); // Extract articles from response
          setHasLoaded(true);
        } catch (error) {
          console.error('Error fetching articles:', error);
          setArticles([]);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchArticles();
  }, [hasLoaded, isLoading, setArticles, setIsLoading, setHasLoaded]);

  const handleDelete = async (articleId: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await fetchWithAuth('/api/articles/' + articleId, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Articles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No articles yet. Generate your first article!
            </p>
          ) : (
            articles.map((article: Article) => (
              <div key={article._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium">{article.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Generated {formatDistanceToNow(new Date(article.createdAt))} ago
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button 
                      className="text-blue-500 hover:text-blue-600"
                      onClick={() => window.open(`/articles/${article._id}`, '_blank')}
                    >
                      View
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(article._id!)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {article.coverImage && (
                  <img 
                    src={article.coverImage} 
                    alt={article.title}
                    className="mt-4 w-full h-48 object-cover rounded-md"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 