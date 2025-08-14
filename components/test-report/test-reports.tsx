"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, FileText, TrendingUp, TrendingDown, Search, Calendar as CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import TestReportBulkUpload from "./TestReportBulkUpload"
import toast from "react-hot-toast"
import { getAllTestScores, searchTestScore } from "../../server/server"

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
  biologyMarks?: number
}

export function TestReports() {
  const [testReports, setTestReports] = useState<TestReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [localSearchTerm, setLocalSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<TestReport[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  const [totalReports, setTotalReports] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  const [formData, setFormData] = useState({
    studentName: "",
    rollNumber: "",
    testName: "",
    testDate: "",
    physicsMarks: "",
    chemistryMarks: "",
    biologyMarks: "",
    maxMarks: "400",
  })
  
  // Function to fetch test scores with pagination
  const fetchTestScores = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const data = await getAllTestScores(page, itemsPerPage);
      console.log("Fetched test scores:", data);
      
      if(!data.data || data.data.length === 0) {
        setTestReports([]);
        setTotalReports(0);
        setTotalPages(0);
        return;
      }
      
      // Set pagination info from backend response
      setTotalReports(data.total || data.data.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.data.length) / itemsPerPage));
      
      // Transform data to match our UI format
      const formattedData = data.data.map((score: TestReport) => {
        // Extract subject marks for easy display
        const physicsSubject = score.subjects.find(s => s.name === 'physics');
        const chemistrySubject = score.subjects.find(s => s.name === 'chemistry');
        const biologySubject = score.subjects.find(s => s.name === 'biology');
        
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
      setTestReports([]);
      setTotalReports(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch on component mount
  useEffect(() => {
    fetchTestScores(1);
  }, []);

  // Fetch data when page changes
  useEffect(() => {
    fetchTestScores(currentPage);
  }, [currentPage]);

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
      biologyMarks: "",
      maxMarks: "400",
    });
    setIsAddDialogOpen(false);
    
    // Refresh the data
    await fetchTestScores();
  }

  // Handle search functionality with Enter key
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setSearchTerm("");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchTerm(searchQuery);
    
    try {
      const result = await searchTestScore(searchQuery.trim());
      console.log("Search result:", result);
      
      if (result && Array.isArray(result)) {
        // Transform search results to match our UI format
        const formattedResults = result.map((score: any) => {
          const physicsSubject = score.subjects?.find((s: any) => s.name === 'physics');
          const chemistrySubject = score.subjects?.find((s: any) => s.name === 'chemistry');
          const biologySubject = score.subjects?.find((s: any) => s.name === 'biology');
          
          const totalSubjectMarks = score.subjects?.reduce((sum: number, subject: any) => sum + subject.marks, 0) || 0;
          const maxMarks = (score.subjects?.length || 0) * 100;
          const percentage = maxMarks > 0 ? Math.round((totalSubjectMarks / maxMarks) * 100 * 10) / 10 : 0;
          
          return {
            ...score,
            physicsMarks: physicsSubject ? physicsSubject.marks : 0,
            chemistryMarks: chemistrySubject ? chemistrySubject.marks : 0,
            biologyMarks: biologySubject ? biologySubject.marks : 0,
            testName: "Test Report",
            testDate: score.date,
            totalMarks: score.total || totalSubjectMarks,
            maxMarks: maxMarks,
            percentage: percentage,
            studentRollNo: score.rollNumber
          };
        });
        
        setSearchResults(formattedResults);
        if (formattedResults.length === 0) {
          setSearchError("No test reports found");
        }
      } else if (result) {
        // Handle single result
        const formattedResult = [{
          ...result,
          testName: "Test Report",
          testDate: result.date,
          studentRollNo: result.rollNumber
        }];
        setSearchResults(formattedResult);
      } else {
        setSearchResults([]);
        setSearchError("No test reports found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSearchError("Search failed. Please try again.");
      toast.error("Failed to search test reports");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(localSearchTerm);
    }
  };

  // Clear search results
  const clearSearch = () => {
    setLocalSearchTerm("");
    setSearchTerm("");
    setSearchResults([]);
    setSearchError(null);
  };

  // Filter and search logic
  const filteredReports = useMemo(() => {
    // If we have search results, use them instead of regular reports
    if (searchTerm && searchResults.length > 0) {
      return searchResults;
    }
    
    // If we have a search term but no results, show empty array
    if (searchTerm && searchResults.length === 0) {
      return [];
    }
    
    // Otherwise, use regular test reports with date filtering
    let filtered = testReports;

    // Apply date filter only (search is handled separately via API)
    if (dateFilter) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.date);
        return reportDate.toDateString() === dateFilter.toDateString();
      });
    }

    return filtered;
  }, [testReports, searchTerm, searchResults, dateFilter]);

  // For server-side pagination, we'll use the filtered reports directly
  // Note: In the future, we should move search and filtering to the backend too
  const currentReports = filteredReports;

  // Reset to first page when date filter changes and refetch data
  useEffect(() => {
    if (dateFilter) {
      setCurrentPage(1);
      // Don't refetch if we're in search mode
      if (!searchTerm) {
        fetchTestScores(1);
      }
    }
  }, [dateFilter]);

  const clearFilters = () => {
    clearSearch();
    setDateFilter(undefined);
    setCurrentPage(1);
    fetchTestScores(1); // Refetch original data
  };

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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Test Reports
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {searchTerm ? (
                  `Showing ${filteredReports.length} search result${filteredReports.length !== 1 ? 's' : ''}`
                ) : (
                  `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalReports)} of ${totalReports} reports`
                )}
              </span>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 " style={{marginTop: "20px"}}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by roll number, student name, or batch... (Press Enter to search)"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              )}
              {localSearchTerm.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 bg-white border rounded px-2 py-1 shadow-sm z-10">
                  {searchTerm ? (
                    searchResults.length > 0 ? `Found ${searchResults.length} test report(s)` : 
                    searchError || 'No results found'
                  ) : 'Press Enter to search...'}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {/* Date Filter */}
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateFilter && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={(date) => {
                      setDateFilter(date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {/* Clear Filters */}
              {(searchTerm || dateFilter) && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-max table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[80px]">Roll No.</TableHead>
                  <TableHead className="min-w-[150px]">Student Name</TableHead>
                  <TableHead className="min-w-[120px]">Test</TableHead>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                  <TableHead className="min-w-[80px]">Physics</TableHead>
                  <TableHead className="min-w-[80px]">Chemistry</TableHead>
                  <TableHead className="min-w-[80px]">Biology</TableHead>
                  <TableHead className="min-w-[80px]">Total</TableHead>
                  <TableHead className="min-w-[90px]">Percentile</TableHead>
                  <TableHead className="min-w-[120px]">Performance</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mr-2"></div>
                        Loading test reports...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10">
                      {searchTerm ? (
                        <div>
                          <p className="text-gray-500">
                            {searchError || "No test reports found for your search."}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            Try searching with a different roll number, student name, or batch name.
                          </p>
                          <Button variant="link" onClick={clearFilters} className="mt-1">
                            Clear search
                          </Button>
                        </div>
                      ) : filteredReports.length === 0 && testReports.length > 0 ? (
                        <div>
                          <p className="text-gray-500">No test reports match your filters.</p>
                          <Button variant="link" onClick={clearFilters} className="mt-1">
                            Clear filters
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500">No test reports found.</p>
                          <p className="text-gray-500 text-sm mt-1">Upload reports using the Bulk Upload button or add individual reports.</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentReports.map((report, index) => {
                    const percentage = report.percentile || 0;
                    return (
                      <TableRow key={report._id}>
                        <TableCell className="font-medium min-w-[80px]">{report.studentRollNo || report.rollNumber || 'N/A'}</TableCell>
                        <TableCell className="min-w-[150px]">{report.studentName || 'N/A'}</TableCell>
                        <TableCell className="min-w-[120px]">{report.testName || 'Test Report'}</TableCell>
                          <TableCell className="min-w-[100px]">{format(new Date(report.date), "dd/MM/yy")}</TableCell>
                        <TableCell className="min-w-[80px]">{report.physicsMarks || 0}</TableCell>
                        <TableCell className="min-w-[80px]">{report.chemistryMarks || 0}</TableCell>
                        <TableCell className="min-w-[80px]">{report.biologyMarks || 'N/A'}</TableCell>
                        <TableCell className="font-medium min-w-[80px]">
                          {report.total}
                        </TableCell>
                        <TableCell className="min-w-[90px]">
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
                        <TableCell className="min-w-[120px]">
                          {percentage >= 80 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell className="min-w-[100px]">
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
          
          {/* Pagination Controls */}
          {filteredReports.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalReports)} of {totalReports} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
