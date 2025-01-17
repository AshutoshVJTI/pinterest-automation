'use client'

import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface KeywordSelectorProps {
  selectedKeyword: string;
  onKeywordToggle: (keyword: string) => void;
}

export function KeywordSelector({ selectedKeyword, onKeywordToggle }: KeywordSelectorProps) {
  const keywords = [
    "Fashion",
    "Technology",
    "Food",
    "Travel",
    "Lifestyle",
    "Health",
    "Business",
    "Education"
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select a Topic</h2>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <button
            key={keyword}
            onClick={() => onKeywordToggle(keyword)}
            className={`px-4 py-2 rounded-full border ${
              selectedKeyword === keyword
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
            }`}
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
}

