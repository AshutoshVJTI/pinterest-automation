import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Article } from '@/types/article';

interface ArticlesContextType {
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  hasLoaded: boolean;
  setHasLoaded: (loaded: boolean) => void;
  refreshArticles: () => void;
}

const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export function ArticlesProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const refreshArticles = () => {
    setHasLoaded(false);
  };

  return (
    <ArticlesContext.Provider 
      value={{ 
        articles, 
        setArticles, 
        isLoading, 
        setIsLoading,
        hasLoaded,
        setHasLoaded,
        refreshArticles
      }}
    >
      {children}
    </ArticlesContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticlesContext);
  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticlesProvider');
  }
  return context;
} 