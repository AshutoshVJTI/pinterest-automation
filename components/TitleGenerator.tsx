'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

export default function TitleGenerator({ keywords, onSelect }: { keywords: string[], onSelect: (title: string) => void }) {
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState<string>('')

  useEffect(() => {
    const generateTitles = async () => {
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords })
      })
      const data = await response.json()
      setTitles(data.titles)
    }
    generateTitles()
  }, [keywords])

  const handleSubmit = () => {
    onSelect(selectedTitle)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-4">Select a Title</h2>
      <RadioGroup onValueChange={setSelectedTitle} value={selectedTitle}>
        {titles.map((title, index) => (
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
      <Button 
        onClick={handleSubmit} 
        className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white" 
        disabled={!selectedTitle}
      >
        Generate Article
      </Button>
    </motion.div>
  )
}

