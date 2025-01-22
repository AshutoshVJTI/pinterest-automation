import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Analytics() {
  return (
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
  );
} 