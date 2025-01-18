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
  const [articles, setArticles] = useState([]);

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

  async function fetchArticles() {
    try {
      const response = await fetchWithAuth('/api/articles');
      const data = await response.json();
      
      if (response.ok) {
        setArticles(data.articles);
      } else {
        console.error('Failed to fetch articles:', data.error);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  }

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
        setArticles(articlesData.articles);
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
            <Card>
              <CardHeader>
                <CardTitle>Generate New Article</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                  
                  {/* Step 1: Select Keyword */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Step 1: Select Topic</h2>
                    <KeywordSelector 
                      selectedKeyword={selectedKeyword}
                      onKeywordsSelected={handleKeywordSelected}
                      isLoading={isLoading}
                    />
                  </div>

                  {/* Step 2: Generate and Select Title */}
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

                  {/* Step 3: Generate Article */}
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
          </TabsContent>

          <TabsContent value="articles" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Your Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Article list */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">How to Start a Garden</h3>
                        <p className="text-sm text-muted-foreground">Generated on: 2024-03-20</p>
                      </div>
                      <div className="space-x-2">
                        <button className="text-blue-500 hover:text-blue-600">Edit</button>
                        <button className="text-blue-500 hover:text-blue-600">View</button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pins" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Generate Pinterest Pin</CardTitle>
              </CardHeader>
              <CardContent>
                <PinterestPoster 
                  title={selectedTitle}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  onError={handleError}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">123</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Generated This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">45</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">78%</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Help Center</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2">Getting Started</h3>
                  <p className="text-muted-foreground">Learn how to use the article generator...</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2">FAQs</h3>
                  <p className="text-muted-foreground">Common questions and answers...</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Contact Support</h3>
                  <button className="text-blue-500 hover:text-blue-600">
                    Send us a message
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1">API Key</label>
                    <input 
                      type="password" 
                      className="w-full p-2 border rounded-md"
                      value="**********************"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1">Language</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 