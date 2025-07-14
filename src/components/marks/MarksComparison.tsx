import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StudentMarks {
  id: string;
  name: string;
  batch: string;
  physics: number;
  chemistry: number;
  mathematics: number;
  total: number;
  percentage: number;
  rank: number;
  trend: "up" | "down" | "same";
}

const mockMarksData: StudentMarks[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    batch: "JEE-2024-A",
    physics: 92,
    chemistry: 88,
    mathematics: 95,
    total: 275,
    percentage: 91.67,
    rank: 1,
    trend: "up",
  },
  {
    id: "2",
    name: "Priya Patel",
    batch: "JEE-2024-A",
    physics: 85,
    chemistry: 90,
    mathematics: 88,
    total: 263,
    percentage: 87.67,
    rank: 2,
    trend: "same",
  },
  {
    id: "3",
    name: "Arjun Singh",
    batch: "JEE-2024-B",
    physics: 80,
    chemistry: 82,
    mathematics: 90,
    total: 252,
    percentage: 84.0,
    rank: 3,
    trend: "down",
  },
  {
    id: "4",
    name: "Anita Kumar",
    batch: "JEE-2024-B",
    physics: 78,
    chemistry: 85,
    mathematics: 82,
    total: 245,
    percentage: 81.67,
    rank: 4,
    trend: "up",
  },
];

const batches = ["All Batches", "JEE-2024-A", "JEE-2024-B", "JEE-2025-A"];

export function MarksComparison() {
  const [selectedBatch, setSelectedBatch] = useState("All Batches");
  const [marksData] = useState<StudentMarks[]>(mockMarksData);

  const filteredData = marksData.filter(
    (student) => selectedBatch === "All Batches" || student.batch === selectedBatch
  );

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 80) return "text-primary";
    if (percentage >= 70) return "text-warning";
    return "text-destructive";
  };

  const getSubjectColor = (marks: number) => {
    if (marks >= 90) return "bg-success/10 text-success";
    if (marks >= 80) return "bg-primary/10 text-primary";
    if (marks >= 70) return "bg-warning/10 text-warning";
    return "bg-destructive/10 text-destructive";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const averageMarks = {
    physics: Math.round(filteredData.reduce((sum, student) => sum + student.physics, 0) / filteredData.length),
    chemistry: Math.round(filteredData.reduce((sum, student) => sum + student.chemistry, 0) / filteredData.length),
    mathematics: Math.round(filteredData.reduce((sum, student) => sum + student.mathematics, 0) / filteredData.length),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marks Comparison</h1>
          <p className="text-muted-foreground">
            Compare student performance across subjects
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch} value={batch}>
                  {batch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Average Physics
              </p>
              <p className="text-2xl font-bold text-primary">{averageMarks.physics}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Average Chemistry
              </p>
              <p className="text-2xl font-bold text-success">{averageMarks.chemistry}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Average Mathematics
              </p>
              <p className="text-2xl font-bold text-warning">{averageMarks.mathematics}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Total Students
              </p>
              <p className="text-2xl font-bold">{filteredData.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-center">Physics</TableHead>
                  <TableHead className="text-center">Chemistry</TableHead>
                  <TableHead className="text-center">Mathematics</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Percentage</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Badge variant="outline">#{student.rank}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.batch}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={getSubjectColor(student.physics)}
                      >
                        {student.physics}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={getSubjectColor(student.chemistry)}
                      >
                        {student.chemistry}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={getSubjectColor(student.mathematics)}
                      >
                        {student.mathematics}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {student.total}/300
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold ${getGradeColor(student.percentage)}`}>
                        {student.percentage.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getTrendIcon(student.trend)}
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