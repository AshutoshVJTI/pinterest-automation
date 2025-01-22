import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Download, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratePinProps {
  title: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  handleError: (error: string) => void;
}

export function GeneratePin({ title, isLoading, setIsLoading, handleError }: GeneratePinProps) {
  const [images, setImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState(title);
  const [isPinterestConnected, setIsPinterestConnected] = useState(false);
  const { toast } = useToast();

  const connectPinterest = async () => {
    try {
      const response = await fetch('/api/auth/pinterest');
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      handleError('Failed to connect to Pinterest');
    }
  };

  const postToPinterest = async (imageUrl: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pinterest/create-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          title: prompt,
          description: prompt
        }),
      });

      if (!response.ok) throw new Error('Failed to post to Pinterest');

      toast({
        title: "Success!",
        description: "Pin created successfully on Pinterest",
      });
    } catch (error) {
      handleError('Failed to post to Pinterest');
    } finally {
      setIsLoading(false);
    }
  };

  const generateImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setImages(data.imageUrls);
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Failed to generate images');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pinterest-pin-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      handleError('Failed to download image');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Generate Pinterest Pin
          <Button
            variant="outline"
            onClick={connectPinterest}
            disabled={isPinterestConnected}
          >
            {isPinterestConnected ? "Connected to Pinterest" : "Connect Pinterest"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter title or description for the pin"
            disabled={isLoading}
          />
          <Button onClick={generateImages} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={`Generated pin ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadImage(imageUrl)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {isPinterestConnected && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => postToPinterest(imageUrl)}
                    disabled={isLoading}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Post to Pinterest
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 