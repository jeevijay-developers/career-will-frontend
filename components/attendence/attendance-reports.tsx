"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Loader2,
} from "lucide-react";
import AttendanceBulkUpload from "./AttendanceBulkUpload";
import {
  getAttendanceByDate,
  addAttendance,
  getAttendanceByRollNumber,
} from "../../server/server.js";
import toast from "react-hot-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AttendanceRecord {
  _id: string;
  rollNo: string;
  name: string;
  inTime: string;
  outTime: string;
  lateArrival: string;
  earlyDeparture: string;
  workingHours: string;
  otDuration: string;
  presentStatus: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// For legacy compatibility with existing form/dialog
interface FormAttendanceRecord {
  id: string;
  studentName: string;
  rollNumber: string;
  date: string;
  status: "present" | "absent" | "late";
  batch: string;
  subject: string;
}

export function AttendanceReports() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [rollNumberSearch, setRollNumberSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRollNumberMode, setIsRollNumberMode] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    date: "",
    inTime: "",
    outTime: "",
    lateArrival: "",
    earlyDeparture: "",
    workingHours: "",
    otDuration: "",
    presentStatus: "",
  });

  // Fetch attendance data when date changes
  useEffect(() => {
    if (!isRollNumberMode) {
      fetchAttendanceData();
    }
  }, [selectedDate, isRollNumberMode]);

  // Handle pagination for roll number search
  useEffect(() => {
    if (isRollNumberMode && rollNumberSearch.trim() && currentPage > 1) {
      searchByRollNumber(currentPage);
    }
  }, [currentPage, isRollNumberMode, rollNumberSearch]);

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      // Format the date as needed for the API (YYYY-MM-DD)
      const formattedDate = selectedDate; // API expects YYYY-MM-DD format which we already have
      console.log("Fetching attendance for date:", formattedDate);
      const response = await getAttendanceByDate(formattedDate);

      if (Array.isArray(response)) {
        setAttendance(response);
        if (response.length === 0) {
          toast(`No attendance records found for ${selectedDate}`);
        }
      } else {
        console.error("Unexpected response format:", response);
        toast.error("Failed to fetch attendance data");
        setAttendance([]);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Failed to fetch attendance data");
      setAttendance([]);
    } finally {
      setIsLoading(false);
      // Reset to page 1 when fetching new data
      setCurrentPage(1);
      // Clear roll number search mode when changing date
      setIsRollNumberMode(false);
    }
  };

  const searchByRollNumber = async (page = 1) => {
    if (!rollNumberSearch.trim()) {
      toast.error("Please enter a roll number to search");
      return;
    }

    try {
      setIsLoading(true);
      console.log(
        "Searching attendance for roll number:",
        rollNumberSearch,
        "page:",
        page
      );
      const response = await getAttendanceByRollNumber(
        rollNumberSearch.trim(),
        page,
        10
      );

      if (response && response.data && Array.isArray(response.data)) {
        setAttendance(response.data);
        setPagination(response.pagination);
        setIsRollNumberMode(true);
        setCurrentPage(page);

        if (response.data.length === 0) {
          toast(
            `No attendance records found for roll number ${rollNumberSearch}`
          );
        } else {
          toast.success(
            `Found ${response.pagination.total} attendance records for roll number ${rollNumberSearch}`
          );
        }
      } else {
        console.error("Unexpected response format:", response);
        toast.error("Failed to fetch attendance data");
        setAttendance([]);
        setPagination({
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        });
      }
    } catch (error) {
      console.error("Error fetching attendance by roll number:", error);
      toast.error("Failed to fetch attendance data for roll number");
      setAttendance([]);
      setPagination({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAttendance = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.rollNo.trim() || !formData.date) {
        toast.error("Please fill in all required fields (Name, Roll No, Date)");
        return;
      }

      // Create attendance record matching the API format
      const attendanceRecord = {
        name: formData.name.trim(),
        rollNo: formData.rollNo.trim(),
        date: formData.date,
        inTime: formData.inTime || "",
        outTime: formData.outTime || "",
        lateArrival: formData.lateArrival || "",
        earlyDeparture: formData.earlyDeparture || "",
        workingHours: formData.workingHours || "",
        otDuration: formData.otDuration || "",
        presentStatus: formData.presentStatus || "Yes",
      };

      console.log("Creating attendance record:", attendanceRecord);

      // Call the API to create the attendance record
      const response = await addAttendance(attendanceRecord);
      console.log("Attendance created successfully:", response);

      toast.success("Attendance marked successfully!");

      // Reset form
      setFormData({
        name: "",
        rollNo: "",
        date: "",
        inTime: "",
        outTime: "",
        lateArrival: "",
        earlyDeparture: "",
        workingHours: "",
        otDuration: "",
        presentStatus: "",
      });

      // Close dialog
      setIsAddDialogOpen(false);

      // Refresh the attendance data
      fetchAttendanceData();
    } catch (error) {
      console.error("Error adding attendance:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to mark attendance";
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Yes":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "No":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "P": // Legacy support
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "A": // Legacy support
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "L": // Legacy support
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "Yes":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "No":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "P": // Legacy support
        return `${baseClasses} bg-green-100 text-green-800`;
      case "A": // Legacy support
        return `${baseClasses} bg-red-100 text-red-800`;
      case "L": // Legacy support
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Yes":
        return "Present";
      case "No":
        return "Absent";
      case "P": // Legacy support
        return "Present";
      case "A": // Legacy support
        return "Absent";
      case "L": // Legacy support
        return "Late";
      default:
        return status || "Unknown";
    }
  };

  const handleRefresh = () => {
    fetchAttendanceData();
  };

  // For roll number mode, use server-side pagination; for date mode, show all records
  const displayRecords = attendance;
  const totalPages = isRollNumberMode
    ? pagination.totalPages
    : Math.ceil(attendance.length / itemsPerPage);
  const startIndex = isRollNumberMode
    ? (pagination.page - 1) * pagination.limit
    : (currentPage - 1) * itemsPerPage;
  const paginatedRecords = isRollNumberMode
    ? displayRecords
    : attendance.slice(startIndex, startIndex + itemsPerPage);

  // Debug pagination
  console.log("Pagination Debug:", {
    isRollNumberMode,
    totalRecords: isRollNumberMode ? pagination.total : attendance.length,
    totalPages,
    currentPage: isRollNumberMode ? pagination.page : currentPage,
    startIndex,
    paginatedRecordsCount: paginatedRecords.length,
    pagination: isRollNumberMode ? pagination : null,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Attendance
          </h1>
          <p className="text-gray-600">
            Track and manage coaching student attendance
          </p>
        </div>
        <div className="flex gap-3">
          <AttendanceBulkUpload onUploadSuccess={handleRefresh} />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Mark Student Attendance
              </Button>
            </DialogTrigger>
            <DialogContent
              aria-describedby={undefined}
              className="max-w-4xl max-h-[80vh] overflow-y-auto"
            >
              <DialogHeader>
                <DialogTitle>Mark Student Attendance</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Student Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter student name"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNo">Roll Number</Label>
                      <Input
                        id="rollNo"
                        value={formData.rollNo}
                        onChange={(e) =>
                          setFormData({ ...formData, rollNo: e.target.value })
                        }
                        placeholder="Enter roll number"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Class Timing */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Class Timing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inTime">Class Start Time</Label>
                      <Input
                        id="inTime"
                        type="time"
                        value={formData.inTime}
                        onChange={(e) =>
                          setFormData({ ...formData, inTime: e.target.value })
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outTime">Class End Time</Label>
                      <Input
                        id="outTime"
                        type="time"
                        value={formData.outTime}
                        onChange={(e) =>
                          setFormData({ ...formData, outTime: e.target.value })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Attendance Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Attendance Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lateArrival">
                        Late Arrival (minutes)
                      </Label>
                      <Input
                        id="lateArrival"
                        value={formData.lateArrival}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lateArrival: e.target.value,
                          })
                        }
                        placeholder="Enter minutes late (e.g., 15)"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="earlyDeparture">
                        Early Departure (minutes)
                      </Label>
                      <Input
                        id="earlyDeparture"
                        value={formData.earlyDeparture}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            earlyDeparture: e.target.value,
                          })
                        }
                        placeholder="Enter minutes early (e.g., 30)"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workingHours">
                        Class Duration (hours)
                      </Label>
                      <Input
                        id="workingHours"
                        value={formData.workingHours}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workingHours: e.target.value,
                          })
                        }
                        placeholder="Enter duration (e.g., 2.5)"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otDuration">
                        Extra Study Time (hours)
                      </Label>
                      <Input
                        id="otDuration"
                        value={formData.otDuration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            otDuration: e.target.value,
                          })
                        }
                        placeholder="Enter extra time (e.g., 1)"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Attendance Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Attendance Status
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="presentStatus">
                      Was the student present today?
                    </Label>
                    <Select
                      value={formData.presentStatus}
                      onValueChange={(value) =>
                        setFormData({ ...formData, presentStatus: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select attendance status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes - Present</SelectItem>
                        <SelectItem value="No">No - Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAttendance}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Mark Student Attendance
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
              Daily Student Attendance
            </CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label htmlFor="rollNumberSearch">Roll No:</Label>
                <Input
                  id="rollNumberSearch"
                  placeholder="Enter roll number"
                  value={rollNumberSearch}
                  onChange={(e) => setRollNumberSearch(e.target.value)}
                  className="w-40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchByRollNumber(1);
                    }
                  }}
                />
                <Button
                  onClick={() => searchByRollNumber(1)}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
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
                <Button
                  onClick={() => {
                    setRollNumberSearch("");
                    setIsRollNumberMode(false);
                    setCurrentPage(1);
                    setPagination({
                      total: 0,
                      page: 1,
                      limit: 10,
                      totalPages: 0,
                      hasNext: false,
                      hasPrev: false,
                    });
                    fetchAttendanceData();
                  }}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  View All
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                Loading attendance data...
              </span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class Start</TableHead>
                      <TableHead>Class End</TableHead>
                      <TableHead>Late Arrival (min)</TableHead>
                      <TableHead>Class Duration</TableHead>
                      <TableHead>Attendance Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">
                          {record.rollNo}
                        </TableCell>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.inTime}</TableCell>
                        <TableCell>{record.outTime}</TableCell>
                        <TableCell>{record.lateArrival}</TableCell>
                        <TableCell>{record.workingHours}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.presentStatus)}
                            <span
                              className={getStatusBadge(record.presentStatus)}
                            >
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
                  {isRollNumberMode
                    ? `No attendance records found for roll number ${rollNumberSearch}`
                    : "No attendance records found for this date"}
                </div>
              )}

              {((isRollNumberMode && pagination.totalPages > 1) ||
                (!isRollNumberMode && totalPages > 1)) && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {isRollNumberMode ? (
                      <>
                        Showing {startIndex + 1} to{" "}
                        {Math.min(
                          startIndex + pagination.limit,
                          pagination.total
                        )}{" "}
                        of {pagination.total} entries
                      </>
                    ) : (
                      <>
                        Showing {startIndex + 1} to{" "}
                        {Math.min(startIndex + itemsPerPage, attendance.length)}{" "}
                        of {attendance.length} entries
                      </>
                    )}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => {
                            if (isRollNumberMode) {
                              if (pagination.hasPrev) {
                                setCurrentPage(pagination.page - 1);
                              }
                            } else {
                              setCurrentPage((p) => Math.max(1, p - 1));
                            }
                          }}
                          className={
                            (
                              isRollNumberMode
                                ? !pagination.hasPrev
                                : currentPage === 1
                            )
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {/* Show limited page numbers with ellipsis for larger sets */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          const activePage = isRollNumberMode
                            ? pagination.page
                            : currentPage;
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= activePage - 1 && page <= activePage + 1)
                          );
                        })
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
                                isActive={
                                  page ===
                                  (isRollNumberMode
                                    ? pagination.page
                                    : currentPage)
                                }
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => {
                            if (isRollNumberMode) {
                              if (pagination.hasNext) {
                                setCurrentPage(pagination.page + 1);
                              }
                            } else {
                              setCurrentPage((p) =>
                                Math.min(totalPages, p + 1)
                              );
                            }
                          }}
                          className={
                            (
                              isRollNumberMode
                                ? !pagination.hasNext
                                : currentPage === totalPages
                            )
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
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
  );
}
