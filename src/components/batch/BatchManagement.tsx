import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Users, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Batch {
  id: string;
  name: string;
  year: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolled: number;
  instructor: string;
  status: "active" | "upcoming" | "completed";
}

const mockBatches: Batch[] = [
  {
    id: "1",
    name: "JEE-2024-A",
    year: "2024",
    startDate: "2023-04-01",
    endDate: "2024-05-31",
    capacity: 30,
    enrolled: 25,
    instructor: "Dr. Rajesh Kumar",
    status: "active",
  },
  {
    id: "2",
    name: "JEE-2024-B",
    year: "2024",
    startDate: "2023-04-15",
    endDate: "2024-05-31",
    capacity: 30,
    enrolled: 28,
    instructor: "Dr. Priya Sharma",
    status: "active",
  },
  {
    id: "3",
    name: "JEE-2025-A",
    year: "2025",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    capacity: 35,
    enrolled: 0,
    instructor: "Dr. Amit Patel",
    status: "upcoming",
  },
];

interface BatchFormData {
  name: string;
  year: string;
  startDate: string;
  endDate: string;
  capacity: string;
  instructor: string;
}

export function BatchManagement() {
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>(mockBatches);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BatchFormData>({
    name: "",
    year: "",
    startDate: "",
    endDate: "",
    capacity: "",
    instructor: "",
  });

  const handleInputChange = (field: keyof BatchFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBatch: Batch = {
      id: Date.now().toString(),
      name: formData.name,
      year: formData.year,
      startDate: formData.startDate,
      endDate: formData.endDate,
      capacity: parseInt(formData.capacity),
      enrolled: 0,
      instructor: formData.instructor,
      status: new Date(formData.startDate) > new Date() ? "upcoming" : "active",
    };

    setBatches((prev) => [...prev, newBatch]);
    setIsDialogOpen(false);
    setFormData({
      name: "",
      year: "",
      startDate: "",
      endDate: "",
      capacity: "",
      instructor: "",
    });
    toast({
      title: "Batch Created",
      description: `Batch ${formData.name} has been successfully created.`,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "upcoming":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Batch Management</h1>
          <p className="text-muted-foreground">
            Create and manage student batches
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchName">Batch Name *</Label>
                  <Input
                    id="batchName"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., JEE-2025-A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year *</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => handleInputChange("year", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                    placeholder="Maximum students"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor *</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => handleInputChange("instructor", e.target.value)}
                    placeholder="Instructor name"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Batch</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Batches
                </p>
                <p className="text-2xl font-bold">{batches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-success/10 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Batches
                </p>
                <p className="text-2xl font-bold">
                  {batches.filter((b) => b.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-warning/10 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming Batches
                </p>
                <p className="text-2xl font-bold">
                  {batches.filter((b) => b.status === "upcoming").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{batch.year}</TableCell>
                    <TableCell>
                      {batch.startDate} to {batch.endDate}
                    </TableCell>
                    <TableCell>{batch.instructor}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {batch.enrolled}/{batch.capacity}
                      </span>
                      <div className="w-full bg-secondary rounded-full h-2 mt-1">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(batch.enrolled / batch.capacity) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(batch.status)}>
                        {batch.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}