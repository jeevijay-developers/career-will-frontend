"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Calendar, CheckCircle, XCircle, Clock, Search, Loader2 } from "lucide-react"
import AttendanceBulkUpload from "./AttendanceBulkUpload"
import { getAttendanceByDate } from "../../server/server.js"
import toast from "react-hot-toast"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface AttendanceRecord {
  _id: string
  rollNo: string
  name: string
  inTime: string
  outTime: string
  lateArrival: string
  earlyDeparture: string
  workingHours: string
  otDuration: string
  presentStatus: string
  date: string
  createdAt: string
  updatedAt: string
}

// For legacy compatibility with existing form/dialog
interface FormAttendanceRecord {
  id: string
  studentName: string
  rollNumber: string
  date: string
  status: "present" | "absent" | "late"
  batch: string
  subject: string
}

export function AttendanceReports() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const [formData, setFormData] = useState({
    studentName: "",
    rollNumber: "",
    date: "",
    status: "",
    batch: "",
    subject: "",
  })

  // Fetch attendance data when date changes
  useEffect(() => {
    fetchAttendanceData()
  }, [selectedDate])

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true)
      // Format the date as needed for the API (YYYY-MM-DD)
      const formattedDate = selectedDate // API expects YYYY-MM-DD format which we already have
      console.log("Fetching attendance for date:", formattedDate);
      const response = await getAttendanceByDate(formattedDate)
      
      if (Array.isArray(response)) {
        setAttendance(response)
        if (response.length === 0) {
          toast(`No attendance records found for ${selectedDate}`)
        }
      } else {
        console.error("Unexpected response format:", response)
        toast.error("Failed to fetch attendance data")
        setAttendance([])
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error)
      toast.error("Failed to fetch attendance data")
      setAttendance([])
    } finally {
      setIsLoading(false)
      // Reset to page 1 when fetching new data
      setCurrentPage(1)
      // Clear search query when changing date
      setSearchQuery("")
    }
  }

  const handleAddAttendance = () => {
    // Legacy form handling - would need to be updated to match new API
    const newRecord: FormAttendanceRecord = {
      id: Date.now().toString(),
      ...formData,
      status: formData.status as "present" | "absent" | "late",
    }
    
    // Would need API integration here
    console.log("Add attendance record:", newRecord)
    
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
      case "P":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "A":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "L":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-sm font-medium"
    switch (status) {
      case "P":
        return `${baseClasses} bg-green-100 text-green-800`
      case "A":
        return `${baseClasses} bg-red-100 text-red-800`
      case "L":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return baseClasses
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "P":
        return "Present"
      case "A":
        return "Absent"
      case "L":
        return "Late"
      default:
        return status
    }
  }

  const handleRefresh = () => {
    fetchAttendanceData()
  }

  // Filter records by search query (name)
  const filteredBySearch = searchQuery.trim() 
    ? attendance.filter(record => 
        record.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : attendance

  // Calculate pagination
  const totalPages = Math.ceil(filteredBySearch.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRecords = filteredBySearch.slice(startIndex, startIndex + itemsPerPage)

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
            <DialogContent aria-describedby={undefined} className="max-w-lg">
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
                        <SelectItem value="NEET-2024-A">NEET-2024-A</SelectItem>
                        <SelectItem value="NEET-2024-B">NEET-2024-B</SelectItem>
                        <SelectItem value="NEET-2024-C">NEET-2024-C</SelectItem>
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
                        <SelectItem value="Biology">Biology</SelectItem>
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
      </div>      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Attendance
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading attendance data...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>In Time</TableHead>
                      <TableHead>Out Time</TableHead>
                      <TableHead>Late Arrival</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">{record.rollNo}</TableCell>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.inTime}</TableCell>
                        <TableCell>{record.outTime}</TableCell>
                        <TableCell>{record.lateArrival}</TableCell>
                        <TableCell>{record.workingHours}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.presentStatus)}
                            <span className={getStatusBadge(record.presentStatus)}>
                              {getStatusText(record.presentStatus)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {paginatedRecords.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? "No matching attendance records found" : "No attendance records found for this date"}
                </div>
              )}
              
              {filteredBySearch.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                        />
                      </PaginationItem>
                      
                      {/* Show limited page numbers with ellipsis for larger sets */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                        .map((page, i, array) => (
                          <React.Fragment key={page}>
                            {i > 0 && array[i - 1] !== page - 1 && (
                              <PaginationItem>
                                <span className="px-2">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink 
                                onClick={() => setCurrentPage(page)}
                                isActive={page === currentPage}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        ))}
                        
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
