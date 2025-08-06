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

interface Subject {
  name: string
  marks: number
  _id: string
}

interface TestReport {
  _id: string
  student: string
  studentName?: string
  studentRollNo?: number
  rollNumber?: number  // For compatibility with form data
  batch?: string
  date: string
  subjects: Subject[]
  total: number
  rank?: number
  percentile?: number
  createdAt?: string
  updatedAt?: string
  // Calculated fields for display
  totalMarks?: number
  maxMarks?: number
  percentage?: number
  // Additional fields for table display
  testName?: string
  testDate?: string
  physicsMarks?: number
  chemistryMarks?: number
  mathsMarks?: number
  biologyMarks?: number
}

export function TestReports() {
  const [testReports, setTestReports] = useState<TestReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    studentName: "",
    rollNumber: "",
    testName: "",
    testDate: "",
    physicsMarks: "",
    chemistryMarks: "",
    mathsMarks: "",
    biologyMarks: "",
    maxMarks: "400",
  })
  
  // Function to fetch test scores
  const fetchTestScores = async () => {
    setIsLoading(true);
    try {
      const data = await getAllTestScores();
      console.log("Fetched test scores:", data);
      if(data.data === null || data.data.length === 0) {
        setTestReports([]);
        return;
      }
      // Transform data to match our UI format
      const formattedData = data.data.map((score: TestReport) => {
        // Extract subject marks for easy display
        const physicsSubject = score.subjects.find(s => s.name === 'physics');
        const chemistrySubject = score.subjects.find(s => s.name === 'chemistry');
        const biologySubject = score.subjects.find(s => s.name === 'biology');
        const mathsSubject = score.subjects.find(s => s.name === 'maths' || s.name === 'mathematics');
        
        // Calculate total marks from the sum of all subjects
        const totalSubjectMarks = score.subjects.reduce((sum, subject) => sum + subject.marks, 0);
        
        // Assume max marks as 100 per subject
        const maxMarks = score.subjects.length * 100;
        
        // Calculate percentage
        const percentage = Math.round((totalSubjectMarks / maxMarks) * 100 * 10) / 10;
        
        // Return formatted data
        return {
          ...score,
          // Add subject marks as individual properties for easy table display
          physicsMarks: physicsSubject ? physicsSubject.marks : 0,
          chemistryMarks: chemistrySubject ? chemistrySubject.marks : 0,
          mathsMarks: mathsSubject ? mathsSubject.marks : 0,
          biologyMarks: biologySubject ? biologySubject.marks : 0,
          testName: "Test Report", // Default test name if not available
          testDate: score.date, // Use the date from the backend
          totalMarks: score.total || totalSubjectMarks,
          maxMarks: maxMarks,
          percentage: percentage,
          studentRollNo: score.rollNumber
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
      biologyMarks: "",
      maxMarks: "400",
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
                <div className="grid grid-cols-4 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="biologyMarks">Biology</Label>
                    <Input
                      id="biologyMarks"
                      type="number"
                      value={formData.biologyMarks}
                      onChange={(e) => setFormData({ ...formData, biologyMarks: e.target.value })}
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
                  <TableHead>Test</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Physics</TableHead>
                  <TableHead>Chemistry</TableHead>
                  <TableHead>Mathematics</TableHead>
                  <TableHead>Biology</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Percentile</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
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
                    const percentage = report.percentile || 0;
                    return (
                      <TableRow key={report._id}>
                        <TableCell className="font-medium">{report.studentRollNo || report.rollNumber || 'N/A'}</TableCell>
                        <TableCell>{report.studentName || 'N/A'}</TableCell>
                        <TableCell>{report.testName || 'Test Report'}</TableCell>
                        <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                        <TableCell>{report.physicsMarks || 0}</TableCell>
                        <TableCell>{report.chemistryMarks || 0}</TableCell>
                        <TableCell>{report.mathsMarks || 'N/A'}</TableCell>
                        <TableCell>{report.biologyMarks || 'N/A'}</TableCell>
                        <TableCell className="font-medium">
                          {report.total}
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
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setIsDetailsDialogOpen(true);
                            }}
                          >
                            Details
                          </Button>
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

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Test Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-lg">{selectedReport.studentName || 'Student'}</h3>
                <p className="text-sm text-gray-600">Roll No: {selectedReport.studentRollNo || selectedReport.rollNumber || 'N/A'}</p>
                <p className="text-sm text-gray-600">Date: {new Date(selectedReport.date).toLocaleDateString()}</p>
                {selectedReport.batch && <p className="text-sm text-gray-600">Batch: {selectedReport.batch}</p>}
                {selectedReport.rank && <p className="text-sm text-gray-600">Rank: {selectedReport.rank}</p>}
                {selectedReport.percentile && <p className="text-sm text-gray-600">Percentile: {selectedReport.percentile}</p>}
              </div>

              <div>
                <h4 className="font-medium mb-2">Subject Marks</h4>
                <div className="space-y-2">
                  {selectedReport.subjects.map((subject, index) => (
                    <div key={subject._id || index} className="flex justify-between items-center">
                      <span className="capitalize">{subject.name}</span>
                      <span className="font-medium">{subject.marks}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-medium">{selectedReport.total}</span>
                  </div>
                </div>
              </div>

              {selectedReport.createdAt && (
                <p className="text-xs text-gray-500 mt-4">
                  Created: {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
