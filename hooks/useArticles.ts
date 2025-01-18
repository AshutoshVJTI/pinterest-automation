import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Article } from '@/types/article';

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchArticles = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/articles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch articles');

      const data = await response.json();
      setArticles(data.articles);
    } catch (error) {
      setError('Failed to load articles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveArticle = async (articleData: Omit<Article, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) throw new Error('Failed to save article');

      const data = await response.json();
      setArticles(prev => [data.article, ...prev]);
      return data.article;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to save article');
    }
  };

  const deleteArticle = async (articleId: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete article');

      setArticles(prev => prev.filter(article => article._id !== articleId));
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete article');
    }
  };

  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user]);

  return {
    articles,
    loading,
    error,
    saveArticle,
    deleteArticle,
    refreshArticles: fetchArticles,
  };
} 