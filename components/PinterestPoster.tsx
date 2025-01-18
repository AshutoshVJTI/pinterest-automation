'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PinterestPosterProps {
  title: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onError: (error: string) => void;
}

export default function PinterestPoster({ 
  title, 
  isLoading, 
  setIsLoading,
  onError 
}: PinterestPosterProps) {
  const [referralLink, setReferralLink] = useState('')

  const handlePost = async () => {
    setIsLoading(true)
    await fetch('/api/post-to-pinterest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article: title, referralLink })
    })
    setIsLoading(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-4">Post to Pinterest</h2>
      <Input
        type="text"
        placeholder="Enter your referral link (optional)"
        value={referralLink}
        onChange={(e) => setReferralLink(e.target.value)}
        className="mb-4"
      />
      <Button 
        onClick={handlePost} 
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
      >
        {isLoading ? 'Posting...' : 'Post to Pinterest'}
      </Button>
    </motion.div>
  )
}

