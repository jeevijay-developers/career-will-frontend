"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, FileText, TrendingUp, TrendingDown } from "lucide-react"
import TestReportBulkUpload from "./TestReportBulkUpload"

interface TestReport {
  id: string
  studentName: string
  rollNumber: string
  testName: string
  testDate: string
  physicsMarks: number
  chemistryMarks: number
  mathsMarks: number
  totalMarks: number
  maxMarks: number
  percentage: number
}

const mockTestReports: TestReport[] = [
  {
    id: "1",
    studentName: "Rahul Sharma",
    rollNumber: "JEE001",
    testName: "Mock Test 1",
    testDate: "2024-01-20",
    physicsMarks: 85,
    chemistryMarks: 78,
    mathsMarks: 92,
    totalMarks: 255,
    maxMarks: 300,
    percentage: 85,
  },
  {
    id: "2",
    studentName: "Priya Patel",
    rollNumber: "JEE002",
    testName: "Mock Test 1",
    testDate: "2024-01-20",
    physicsMarks: 90,
    chemistryMarks: 88,
    mathsMarks: 85,
    totalMarks: 263,
    maxMarks: 300,
    percentage: 87.7,
  },
]

export function TestReports() {
  const [testReports, setTestReports] = useState<TestReport[]>(mockTestReports)
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

  const handleAddReport = () => {
    const physics = Number.parseInt(formData.physicsMarks)
    const chemistry = Number.parseInt(formData.chemistryMarks)
    const maths = Number.parseInt(formData.mathsMarks)
    const total = physics + chemistry + maths
    const max = Number.parseInt(formData.maxMarks)

    const newReport: TestReport = {
      id: Date.now().toString(),
      studentName: formData.studentName,
      rollNumber: formData.rollNumber,
      testName: formData.testName,
      testDate: formData.testDate,
      physicsMarks: physics,
      chemistryMarks: chemistry,
      mathsMarks: maths,
      totalMarks: total,
      maxMarks: max,
      percentage: Math.round((total / max) * 100 * 10) / 10,
    }

    setTestReports([...testReports, newReport])
    setFormData({
      studentName: "",
      rollNumber: "",
      testName: "",
      testDate: "",
      physicsMarks: "",
      chemistryMarks: "",
      mathsMarks: "",
      maxMarks: "300",
    })
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Reports</h1>
          <p className="text-gray-600">Manage and track student test performance</p>
        </div>
        <div className="flex gap-2">
          <TestReportBulkUpload onUploadSuccess={() => {}} />
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
                {testReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.rollNumber}</TableCell>
                    <TableCell>{report.studentName}</TableCell>
                    <TableCell>{report.testName}</TableCell>
                    <TableCell>{report.testDate}</TableCell>
                    <TableCell>{report.physicsMarks}</TableCell>
                    <TableCell>{report.chemistryMarks}</TableCell>
                    <TableCell>{report.mathsMarks}</TableCell>
                    <TableCell className="font-medium">
                      {report.totalMarks}/{report.maxMarks}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          report.percentage >= 80
                            ? "bg-green-100 text-green-800"
                            : report.percentage >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {report.percentage}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {report.percentage >= 80 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
