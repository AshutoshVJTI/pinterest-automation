import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Help() {
  return (
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
  );
} 