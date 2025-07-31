"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, FileText, TrendingUp, TrendingDown } from "lucide-react"
import TestReportBulkUpload from "./TestReportBulkUpload"
import toast from "react-hot-toast"
import { getAllTestScores } from "../../server/server"

interface TestReport {
  _id: string
  studentName: string
  studentRollNo: number
  testName: string
  testDate: string
  physicsMarks: number
  chemistryMarks: number
  mathsMarks: number
  totalMarks?: number
  maxMarks: number
  percentage?: number
}

export function TestReports() {
  const [testReports, setTestReports] = useState<TestReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    studentName: "",
    rollNumber: "",
    testName: "",
    testDate: "",
    physicsMarks: "",
    chemistryMarks: "",
    mathsMarks: "",
    maxMarks: "300",
  })
  
  // Function to fetch test scores
  const fetchTestScores = async () => {
    setIsLoading(true);
    try {
      const data = await getAllTestScores();
      console.log("Fetched test scores:", data);
      
      // Transform data if needed
      const formattedData = data.map((score: any) => {
        // Calculate total and percentage
        const physics = score.physicsMarks || 0;
        const chemistry = score.chemistryMarks || 0;
        const maths = score.mathsMarks || 0;
        const total = physics + chemistry + maths;
        const percentage = score.maxMarks ? Math.round((total / score.maxMarks) * 100 * 10) / 10 : 0;
        
        return {
          ...score,
          totalMarks: total,
          percentage: percentage
        };
      });
      
      setTestReports(formattedData);
    } catch (error) {
      console.error("Error fetching test scores:", error);
      toast.error("Failed to load test reports");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch test scores on component mount
  useEffect(() => {
    fetchTestScores();
  }, []);

  const handleAddReport = async () => {
    // Currently, we're not implementing the create test score endpoint
    // This would be replaced with an API call to create a test score
    // For now, just show a toast message
    toast.success("Test report added successfully");
    setFormData({
      studentName: "",
      rollNumber: "",
      testName: "",
      testDate: "",
      physicsMarks: "",
      chemistryMarks: "",
      mathsMarks: "",
      maxMarks: "300",
    });
    setIsAddDialogOpen(false);
    
    // Refresh the data
    await fetchTestScores();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Reports</h1>
          <p className="text-gray-600">Manage and track student test performance</p>
        </div>
        <div className="flex gap-2">
          <TestReportBulkUpload onUploadSuccess={fetchTestScores} />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Test Report
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Test Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      placeholder="Student name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="Roll number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="testName">Test Name</Label>
                    <Input
                      id="testName"
                      value={formData.testName}
                      onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                      placeholder="e.g., Mock Test 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testDate">Test Date</Label>
                    <Input
                      id="testDate"
                      type="date"
                      value={formData.testDate}
                      onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="physicsMarks">Physics</Label>
                    <Input
                      id="physicsMarks"
                      type="number"
                      value={formData.physicsMarks}
                      onChange={(e) => setFormData({ ...formData, physicsMarks: e.target.value })}
                      placeholder="Marks"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chemistryMarks">Chemistry</Label>
                    <Input
                      id="chemistryMarks"
                      type="number"
                      value={formData.chemistryMarks}
                      onChange={(e) => setFormData({ ...formData, chemistryMarks: e.target.value })}
                      placeholder="Marks"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mathsMarks">Mathematics</Label>
                    <Input
                      id="mathsMarks"
                      type="number"
                      value={formData.mathsMarks}
                      onChange={(e) => setFormData({ ...formData, mathsMarks: e.target.value })}
                      placeholder="Marks"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxMarks">Maximum Marks</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                    placeholder="Total marks"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddReport} className="bg-blue-600 hover:bg-blue-700">
                  Add Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Test Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Physics</TableHead>
                  <TableHead>Chemistry</TableHead>
                  <TableHead>Maths</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mr-2"></div>
                        Loading test reports...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : testReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10">
                      <p className="text-gray-500">No test reports found.</p>
                      <p className="text-gray-500 text-sm mt-1">Upload reports using the Bulk Upload button or add individual reports.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  testReports.map((report) => {
                    const percentage = report.percentage || 0;
                    return (
                      <TableRow key={report._id}>
                        <TableCell className="font-medium">{report.studentRollNo}</TableCell>
                        <TableCell>{report.studentName}</TableCell>
                        <TableCell>{report.testName}</TableCell>
                        <TableCell>{report.testDate}</TableCell>
                        <TableCell>{report.physicsMarks}</TableCell>
                        <TableCell>{report.chemistryMarks}</TableCell>
                        <TableCell>{report.mathsMarks}</TableCell>
                        <TableCell className="font-medium">
                          {report.totalMarks || (report.physicsMarks + report.chemistryMarks + report.mathsMarks)}/{report.maxMarks}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              percentage >= 80
                                ? "bg-green-100 text-green-800"
                                : percentage >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {percentage}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {percentage >= 80 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
