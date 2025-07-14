import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const KitManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kit Management</h1>
        <p className="text-muted-foreground">
          Track student kit items and distribution
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Kit Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Student kit management functionality (bag, bottle, t-shirt, etc.) will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KitManagement;