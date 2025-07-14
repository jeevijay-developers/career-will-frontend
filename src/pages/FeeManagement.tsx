import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FeeManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fee Management</h1>
        <p className="text-muted-foreground">
          Manage student fees and payment tracking
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fee management and installment tracking functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeManagement;