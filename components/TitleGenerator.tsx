'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface TitleGeneratorProps {
  keyword: string;
  onTitlesGenerated: (titles: string[]) => void;
  onTitleSelected: (title: string) => void;
  generatedTitles: string[];
  selectedTitle: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onError: (error: string) => void;
}

export default function TitleGenerator({ 
  keyword,
  onTitlesGenerated,
  onTitleSelected,
  generatedTitles,
  selectedTitle,
  isLoading,
  setIsLoading,
  onError 
}: TitleGeneratorProps) {
  const generateTitles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      // Ensure data.titles is an array
      const titles = Array.isArray(data.titles) ? data.titles : 
                    typeof data.titles === 'string' ? data.titles.split('\n').filter(Boolean) : [];
      
      onTitlesGenerated(titles);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to generate titles');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={generateTitles}
        disabled={isLoading}
        className="w-full md:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Titles...
          </>
        ) : (
          'Generate Titles'
        )}
      </Button>

      {Array.isArray(generatedTitles) && generatedTitles.length > 0 && (
        <div className="space-y-4">
          <RadioGroup onValueChange={onTitleSelected} value={selectedTitle}>
            {generatedTitles.map((title, index) => (
              <motion.div 
                key={index} 
                className="flex items-center space-x-2 mb-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RadioGroupItem value={title} id={`title-${index}`} />
                <Label htmlFor={`title-${index}`} className="text-sm">{title}</Label>
              </motion.div>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
}

