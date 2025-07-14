import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Attendance = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Management</h1>
        <p className="text-muted-foreground">
          Track and manage student attendance
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Attendance management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;