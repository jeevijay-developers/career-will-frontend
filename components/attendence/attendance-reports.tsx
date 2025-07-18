"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"
import AttendanceBulkUpload from "./AttendanceBulkUpload"

interface AttendanceRecord {
  id: string
  studentName: string
  rollNumber: string
  date: string
  status: "present" | "absent" | "late"
  batch: string
  subject: string
}

const mockAttendance: AttendanceRecord[] = [
  {
    id: "1",
    studentName: "Rahul Sharma",
    rollNumber: "JEE001",
    date: "2024-01-20",
    status: "present",
    batch: "JEE-2024-A",
    subject: "Physics",
  },
  {
    id: "2",
    studentName: "Priya Patel",
    rollNumber: "JEE002",
    date: "2024-01-20",
    status: "late",
    batch: "JEE-2024-B",
    subject: "Physics",
  },
]

export function AttendanceReports() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [formData, setFormData] = useState({
    studentName: "",
    rollNumber: "",
    date: "",
    status: "",
    batch: "",
    subject: "",
  })

  const handleAddAttendance = () => {
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      ...formData,
      status: formData.status as "present" | "absent" | "late",
    }
    setAttendance([...attendance, newRecord])
    setFormData({
      studentName: "",
      rollNumber: "",
      date: "",
      status: "",
      batch: "",
      subject: "",
    })
    setIsAddDialogOpen(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-sm font-medium"
    switch (status) {
      case "present":
        return `${baseClasses} bg-green-100 text-green-800`
      case "absent":
        return `${baseClasses} bg-red-100 text-red-800`
      case "late":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return baseClasses
    }
  }

  const handleRefresh = () => {
    // This would typically refresh the attendance data from the server
    // For now, we'll just show a toast
    console.log("Refreshing attendance data...");
  }

  const filteredAttendance = attendance.filter((record) => record.date === selectedDate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex gap-3">
          <AttendanceBulkUpload onUploadSuccess={handleRefresh} />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
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
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Select value={formData.batch} onValueChange={(value) => setFormData({ ...formData, batch: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JEE-2024-A">JEE-2024-A</SelectItem>
                      <SelectItem value="JEE-2024-B">JEE-2024-B</SelectItem>
                      <SelectItem value="JEE-2024-C">JEE-2024-C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAttendance} className="bg-blue-600 hover:bg-blue-700">
                Mark Attendance
              </Button>
            </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Attendance
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="dateFilter">Date:</Label>
              <Input
                id="dateFilter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.rollNumber}</TableCell>
                    <TableCell>{record.studentName}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{record.batch}</span>
                    </TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className={getStatusBadge(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredAttendance.length === 0 && (
            <div className="text-center py-8 text-gray-500">No attendance records found for {selectedDate}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
