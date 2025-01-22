"use client"

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PenSquare, FileText, Image, BarChart2, HelpCircle, Settings, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PinterestPoster from '@/components/PinterestPoster';
import { KeywordSelector } from '@/components/KeywordSelector';
import TitleGenerator from '@/components/TitleGenerator';
import ArticleGenerator from '@/components/ArticleGenerator';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/api';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { GenerateArticles } from './dashboard/GenerateArticles';
import ArticlesList from './dashboard/ArticlesList';
import { GeneratePin } from './dashboard/GeneratePin';
import { Analytics } from './dashboard/Analytics';
import { Help } from './dashboard/Help';
import { SettingsComponent } from './dashboard/Settings';
import { ArticlesProvider } from '../context/ArticlesContext';

interface DashboardProps {
  // Add any props you need
}

export default function Dashboard({}: DashboardProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Test the authentication by fetching articles
        const response = await fetchWithAuth('/api/articles');
        if (!response.ok) {
          throw new Error('Failed to authenticate');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleKeywordSelected = (keyword: string) => {
    setSelectedKeyword(keyword);
    setGeneratedTitles([]);
    setSelectedTitle('');
    setError(null);
  };

  const handleTitlesGenerated = (titles: string[]) => {
    const titlesArray = Array.isArray(titles) ? titles : [];
    setGeneratedTitles(titlesArray);
    setError(null);
  };

  const handleTitleSelected = (title: string) => {
    setSelectedTitle(title);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGenerateArticle = async (prompt: string) => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth('/api/generate-article', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Refresh articles list after generation
        const articlesResponse = await fetchWithAuth('/api/articles');
        const articlesData = await articlesResponse.json();
      } else {
        console.error('Failed to generate article:', data.error);
      }
    } catch (error) {
      console.error('Error generating article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ArticlesProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Tabs defaultValue="generate" orientation="vertical" className="flex w-full">
          <TabsList className="flex flex-col h-screen w-64 bg-white border-r space-y-2 p-4">
            <div className="mb-6 px-3 py-2">
              <h1 className="text-xl font-bold">Pinterest Generator</h1>
            </div>
            
            <TabsTrigger value="generate" className="w-full justify-start gap-2 px-3 py-2">
              <PenSquare className="h-5 w-5" />
              Generate Articles
            </TabsTrigger>
            
            <TabsTrigger value="articles" className="w-full justify-start gap-2 px-3 py-2">
              <FileText className="h-5 w-5" />
              Articles
            </TabsTrigger>
            
            <TabsTrigger value="pins" className="w-full justify-start gap-2 px-3 py-2">
              <Image className="h-5 w-5" />
              Generate Pin
            </TabsTrigger>
            
            <TabsTrigger value="analytics" className="w-full justify-start gap-2 px-3 py-2">
              <BarChart2 className="h-5 w-5" />
              Analytics
            </TabsTrigger>
            
            <TabsTrigger value="help" className="w-full justify-start gap-2 px-3 py-2">
              <HelpCircle className="h-5 w-5" />
              Help
            </TabsTrigger>
            
            <TabsTrigger value="settings" className="w-full justify-start gap-2 px-3 py-2">
              <Settings className="h-5 w-5" />
              Settings
            </TabsTrigger>
            
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </TabsList>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="generate" className="m-0 h-full">
              <GenerateArticles 
                selectedKeyword={selectedKeyword}
                generatedTitles={generatedTitles}
                selectedTitle={selectedTitle}
                isLoading={isLoading}
                error={error}
                setIsLoading={setIsLoading}
                handleKeywordSelected={handleKeywordSelected}
                handleTitlesGenerated={handleTitlesGenerated}
                handleTitleSelected={handleTitleSelected}
                handleError={handleError}
              />
            </TabsContent>

            <TabsContent value="articles" className="m-0">
              <ArticlesList />
            </TabsContent>

            <TabsContent value="pins" className="m-0">
              <GeneratePin 
                title={selectedTitle}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                handleError={handleError}
              />
            </TabsContent>

            <TabsContent value="analytics" className="m-0">
              <Analytics />
            </TabsContent>

            <TabsContent value="help" className="m-0">
              <Help />
            </TabsContent>

            <TabsContent value="settings" className="m-0">
              <SettingsComponent />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ArticlesProvider>
  );
} 