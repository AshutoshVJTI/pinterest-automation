import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsComponent() {
  return (
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
  );
} 