"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  BarChart3,
  PieChart,
  ArrowBigLeft,
//   LogOut
} from "lucide-react";
import toast from "react-hot-toast";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
import {
  getSummaryStats
} from "../server/server";

interface DashboardStats {
  totalStudents: number;
  totalRevenue: number;
  totalCollected: number;
  totalPending?: number;
}

interface BatchWiseStats {
  _id: string | null;
  count: number;
}

interface AttendanceStats {
  date: string;
  present: number;
  absent: number;
  total?: number;
}

interface FeeStatus {
  rollNo: string;
  studentName: string;
  totalFees: number;
  collected: number;
  pending: number;
  status: 'paid' | 'partial' | 'pending';
}

interface TestAttendance {
  date: string;
  present: number;
  absent: number;
  total?: number;
}

interface SummaryStatsResponse {
  totalStudents: number;
  batchWise: BatchWiseStats[];
  totalRevenue: number;
  totalCollected: number;
  attendanceByDate: Record<string, { present: number; absent: number }>;
  weekAttendance: Record<string, { present: number; absent: number }>;
  testAttendance: TestAttendance[];
}

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalRevenue: 0,
    totalCollected: 0,
    totalPending: 0
  });
  const [batchWiseStats, setBatchWiseStats] = useState<BatchWiseStats[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats[]>([]);
  const [feeStatus, setFeeStatus] = useState<FeeStatus[]>([]);
  const [testAttendance, setTestAttendance] = useState<TestAttendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch summary stats from the new API
        const summaryData = await getSummaryStats();
        
        // Transform the data to match our component state
        setStats({
          totalStudents: summaryData.totalStudents,
          totalRevenue: summaryData.totalRevenue,
          totalCollected: summaryData.totalCollected,
          totalPending: summaryData.totalRevenue - summaryData.totalCollected
        });

        setBatchWiseStats(summaryData.batchWise);

        // Transform attendance data from attendanceByDate
        const attendanceArray: AttendanceStats[] = Object.entries(summaryData.attendanceByDate).map(([date, data]) => ({
          date,
          present: (data as { present: number; absent: number }).present,
          absent: (data as { present: number; absent: number }).absent,
          total: (data as { present: number; absent: number }).present + (data as { present: number; absent: number }).absent
        }));
        setAttendanceStats(attendanceArray);

        // Transform test attendance data
        const testAttendanceArray: TestAttendance[] = summaryData.testAttendance.map((test: { date: string; present: number; absent: number }) => ({
          ...test,
          total: test.present + test.absent
        }));
        setTestAttendance(testAttendanceArray);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDateChange = async (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      try {
        // For now, we'll filter existing data by the selected date
        // In a real implementation, you might want to fetch fresh data for the specific date
        const dateStr = date.toISOString().split('T')[0];
        const filteredAttendance = attendanceStats.filter(day => day.date === dateStr);
        if (filteredAttendance.length === 0) {
          // If no data for the selected date, fetch from API
          const summaryData = await getSummaryStats();
          const attendanceArray: AttendanceStats[] = Object.entries(summaryData.attendanceByDate).map(([date, data]) => ({
            date,
            present: (data as { present: number; absent: number }).present,
            absent: (data as { present: number; absent: number }).absent,
            total: (data as { present: number; absent: number }).present + (data as { present: number; absent: number }).absent
          }));
          setAttendanceStats(attendanceArray.filter(day => day.date === dateStr));
        } else {
          setAttendanceStats(filteredAttendance);
        }
      } catch (error) {
        console.error("Error fetching attendance for selected date:", error);
        toast.error("Failed to load attendance data for selected date");
      }
    }
  };

  const handleWeekChange = async (week: string) => {
    setSelectedWeek(week);
    try {
      // For now, fetch all data and filter by week
      // In a real implementation, you might want to have a specific API for weekly data
      const summaryData = await getSummaryStats();
      const weekData = summaryData.weekAttendance[week];
      if (weekData) {
        const weekAttendance: AttendanceStats[] = [{
          date: week,
          present: weekData.present,
          absent: weekData.absent,
          total: weekData.present + weekData.absent
        }];
        setAttendanceStats(weekAttendance);
      } else {
        toast.error("No data available for selected week");
      }
    } catch (error) {
      console.error("Error fetching weekly attendance:", error);
      toast.error("Failed to load weekly attendance data");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case 'pending':
        return <Badge className="bg-red-100 text-red-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleGeneralDashboard = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive overview of all system metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleGeneralDashboard}
              variant="outline"
              className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors duration-200"
            >
              <ArrowBigLeft className="h-5 w-5" />
              General Dashboard
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active enrollments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Expected revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalCollected.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.totalCollected / stats.totalRevenue) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(stats.totalPending || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            {/* <TabsTrigger value="fees">Fee Status</TabsTrigger> */}
            <TabsTrigger value="tests">Test Attendance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Batch-wise Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Active Batches
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {batchWiseStats.map((batch, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{batch._id || "Unassigned"}</p>
                          <p className="text-sm text-gray-600">{batch.count} students</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Batch: {batch._id || "N/A"}</p>
                          <p className="text-sm text-gray-600">{batch.count} enrolled</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Recent Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {attendanceStats.slice(0, 5).map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{day.present}/{day.total} present</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            {day.present}
                          </Badge>
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            <UserX className="h-3 w-3 mr-1" />
                            {day.absent}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Date & Week Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Date</label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateChange}
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Week</label>
                    <Select value={selectedWeek} onValueChange={handleWeekChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select week" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Week</SelectItem>
                        <SelectItem value="last">Last Week</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Daily Attendance Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Attendance %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceStats.map((day, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-green-600 font-medium">{day.present}</TableCell>
                          <TableCell className="text-red-600 font-medium">{day.absent}</TableCell>
                          <TableCell>{day.total || (day.present + day.absent)}</TableCell>
                          <TableCell>{day.total ? ((day.present / day.total) * 100).toFixed(1) : ((day.present / (day.present + day.absent)) * 100).toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fee Status Tab */}
          {/* <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Roll Number Wise Fee Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Total Fees</TableHead>
                      <TableHead>Collected</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeStatus.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{student.rollNo}</TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>₹{student.totalFees.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">₹{student.collected.toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">₹{student.pending.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* Test Attendance Tab */}
          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Attendance Report</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testAttendance.map((test, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">Test {index + 1}</TableCell>
                        <TableCell>{new Date(test.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-green-600 font-medium">{test.present}</TableCell>
                        <TableCell className="text-red-600 font-medium">{test.absent}</TableCell>
                        <TableCell>{test.total || (test.present + test.absent)}</TableCell>
                        <TableCell>{test.total ? ((test.present / test.total) * 100).toFixed(1) : ((test.present / (test.present + test.absent)) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
