"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

// Add predefined niches
const PREDEFINED_NICHES = [
  "Digital Marketing",
  "Personal Finance",
  "Health & Wellness",
  "Home Decor",
  "Self Development",
  "Travel Tips",
  "Food & Cooking",
  "Fashion & Style"
]

interface GeneratedArticle {
  title: string
  html: string    // Complete article HTML
  coverImage: string
  images: string[]
}

export default function ArticleGenerator() {
  const [selectedKeyword, setSelectedKeyword] = useState<string>("")
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null)
  const [article, setArticle] = useState<GeneratedArticle | null>(null)
  const [isLoadingTitles, setIsLoadingTitles] = useState(false)
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false)
  const [customNiche, setCustomNiche] = useState<string>("")

  // Modified to handle both predefined and custom niches
  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeyword(keyword === selectedKeyword ? "" : keyword)
    setCustomNiche("") // Clear custom input when selecting predefined niche
  }

  // Handle custom niche input
  const handleCustomNicheChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomNiche(e.target.value)
    setSelectedKeyword("") // Clear selected predefined niche
  }

  // 1. Generate possible titles based on the selected keyword
  const generateTitles = async () => {
    const nicheToUse = selectedKeyword || customNiche
    if (!nicheToUse) return

    setIsLoadingTitles(true)
    try {
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: nicheToUse }),
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      const titlesList = data.titles
        .split('\n')
        .filter((title: string) => title.trim().length > 0)

      setTitles(titlesList)
    } catch (error) {
      console.error('Error generating titles:', error)
    } finally {
      setIsLoadingTitles(false)
    }
  }

  // 2. Generate the full article (text + images) using the selected title
  const generateArticle = async () => {
    if (!selectedTitle) return
    setIsGeneratingArticle(true)
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: selectedTitle }),
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setArticle(data.article)
    } catch (error) {
      console.error('Error generating article:', error)
    } finally {
      setIsGeneratingArticle(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Predefined Niches Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Select a Niche</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PREDEFINED_NICHES.map((niche) => (
            <Card
              key={niche}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedKeyword === niche ? 'bg-gray-100 border-2 border-blue-500' : ''
              }`}
              onClick={() => handleKeywordToggle(niche)}
            >
              {niche}
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Niche Input */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Or Enter Custom Niche</h2>
        <Input
          type="text"
          placeholder="Enter your niche..."
          value={customNiche}
          onChange={handleCustomNicheChange}
          className="max-w-md"
        />
      </div>

      {/* Generate Titles Button */}
      <Button
        onClick={generateTitles}
        disabled={(!selectedKeyword && !customNiche) || isLoadingTitles}
        className="w-full md:w-auto"
      >
        {isLoadingTitles ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Titles...
          </>
        ) : (
          'Generate Article Titles'
        )}
      </Button>

      {/* Display the generated titles for selection */}
      {titles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select an Article Title</h2>
          <div className="grid gap-4">
            {titles.map((title, index) => (
              <Card
                key={index}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedTitle === title ? 'bg-gray-100 border border-gray-400' : ''
                }`}
                onClick={() => setSelectedTitle(title)}
              >
                {title}
              </Card>
            ))}
          </div>

          <Button
            onClick={generateArticle}
            disabled={!selectedTitle || isGeneratingArticle}
          >
            {isGeneratingArticle ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Article...
              </>
            ) : (
              'Generate Article'
            )}
          </Button>
        </div>
      )}

      {/* Display the generated article */}
      {article && (
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Cover Image */}
          <img 
            src={article.coverImage} 
            alt="Cover" 
            className="w-full h-[400px] object-cover rounded-lg shadow-lg"
          />

          {/* Article Content */}
          <div className="article-container">
            <div 
              className="prose prose-lg prose-blue max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: article.html.replace(
                  /<section class="point">/g, 
                  (match, index) => {
                    // Make sure the image URL exists before using it
                    const imageUrl = article.images[index] || '';
                    return `
                      <section class="point flex flex-col md:flex-row gap-6 items-start bg-white p-6 rounded-xl shadow-md mb-8">
                        ${imageUrl ? `<img src="${imageUrl}" alt="Point ${index + 1}" class="w-full md:w-48 h-48 object-cover rounded-lg shadow-md flex-shrink-0" />` : ''}
                        <div class="flex-grow">
                    `;
                  }
                ).replace(
                  /<\/section>/g,
                  `
                        </div>
                      </section>
                    `
                )
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
