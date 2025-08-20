"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BarChart3, TrendingUp, TrendingDown, Search, Calendar, User, Trophy, Target } from "lucide-react"
import { format } from "date-fns"
import { getMarksComparisonByRollNumber } from "@/server/server"
import { Alert, AlertDescription } from "@/components/ui/alert"
import toast from "react-hot-toast"

interface Subject {
  name: string
  marks: number
  _id: string
}

interface TestData {
  _id: string
  rollNumber: number
  student: string
  father: string
  batch: string
  subjects: Subject[]
  percentile: number
  total: number
  rank: number
  date: string
  name: string
  createdAt: string
  updatedAt: string
}

export function MarksComparison() {
  const [searchRollNumber, setSearchRollNumber] = useState("")
  const [testData, setTestData] = useState<TestData[]>([])
  const [selectedTest, setSelectedTest] = useState<TestData | null>(null)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Function to handle search
  const handleSearch = async () => {
    if (!searchRollNumber || searchRollNumber.trim() === "") {
      toast.error("Please enter a roll number to search")
      return
    }
    
    setLoading(true)    
    try {
      const response = await getMarksComparisonByRollNumber(Number(searchRollNumber))
      if (response.length === 0) {
        toast.error("No test records found for this roll number")
        setTestData([])
        return
      }
      setTestData(response)
      setSelectedTest(null)
    } catch (err) {
      toast.error("No test records found for this roll number")
      setTestData([])
    } finally {
      setLoading(false)
    }
  }

  // Function to handle test selection
  const handleTestSelect = (test: TestData) => {
    setSelectedTest(test)
    setIsModalOpen(true)
  }

  // Function to get subject statistics from all tests
  const getSubjectStats = (subjectName: string) => {
    // Extract all subject marks with the given name
    const allMarks = testData.flatMap(test => 
      test.subjects.filter(subject => subject.name.toLowerCase() === subjectName.toLowerCase())
        .map(subject => subject.marks)
    )
    
    if (allMarks.length === 0) return { average: 0, highest: 0, lowest: 0 }
    
    const average = allMarks.reduce((sum, mark) => sum + mark, 0) / allMarks.length
    const highest = Math.max(...allMarks)
    const lowest = Math.min(...allMarks)
    
    return { 
      average: Math.round(average * 10) / 10, 
      highest, 
      lowest 
    }
  }

  // Get stats for each subject
  const physicsStats = getSubjectStats("physics")
  const chemistryStats = getSubjectStats("chemistry")
  const biologyStats = getSubjectStats("biology")

  // Function to get rank badge color
  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-200"
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  // Function to get performance icon
  const getPerformanceIcon = (marks: number, average: number) => {
    if (marks > average) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
  }
  
  // Function to get subject mark for a specific test
  const getSubjectMark = (test: TestData, subjectName: string) => {
    const subject = test.subjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase())
    return subject ? subject.marks : 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marks Comparison</h1>
        <p className="text-gray-600">Compare student performance across Physics, Chemistry, and Biology</p>
      </div>
      
      {/* Search section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Student by Roll Number
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative w-full sm:w-64">
              <Input
                type="number"
                placeholder="Enter roll number"
                value={searchRollNumber}
                onChange={(e) => setSearchRollNumber(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subject stats cards */}
      {testData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                Physics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average:</span>
                  <span className="font-medium">{physicsStats.average}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Highest:</span>
                  <span className="font-medium text-green-600">{physicsStats.highest}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lowest:</span>
                  <span className="font-medium text-red-600">{physicsStats.lowest}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                Chemistry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average:</span>
                  <span className="font-medium">{chemistryStats.average}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Highest:</span>
                  <span className="font-medium text-green-600">{chemistryStats.highest}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lowest:</span>
                  <span className="font-medium text-red-600">{chemistryStats.lowest}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                Biology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average:</span>
                  <span className="font-medium">{biologyStats.average}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Highest:</span>
                  <span className="font-medium text-green-600">{biologyStats.highest}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lowest:</span>
                  <span className="font-medium text-red-600">{biologyStats.lowest}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test data table */}
      {testData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Test Records for {(testData[0]?.student)?.toLocaleUpperCase()}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Date</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Physics</TableHead>
                    <TableHead>Chemistry</TableHead>
                    <TableHead>Biology</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Percentile</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testData.map((test) => (
                    <TableRow 
                      key={test._id} 
                      className={selectedTest?._id === test._id ? "bg-blue-50" : ""}
                      onClick={() => handleTestSelect(test)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        {format(new Date(test.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium border ${getRankBadge(test.rank)}`}
                        >
                          #{test.rank}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{getSubjectMark(test, "physics")}</span>
                          {getPerformanceIcon(getSubjectMark(test, "physics"), physicsStats.average)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{getSubjectMark(test, "chemistry")}</span>
                          {getPerformanceIcon(getSubjectMark(test, "chemistry"), chemistryStats.average)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{getSubjectMark(test, "biology")}</span>
                          {getPerformanceIcon(getSubjectMark(test, "biology"), biologyStats.average)}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{test.total}</TableCell>
                      <TableCell>{test.percentile}%</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleTestSelect(test)}
                          className={selectedTest?._id === test._id ? "bg-blue-100" : ""}
                        >
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
      )}
      
      {testData.length === 0 && !loading && (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Search for a student by roll number to view their test results</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              Test Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Test Name</p>
                  <p className="font-semibold">{selectedTest.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold">{format(new Date(selectedTest.date), 'dd MMM yyyy')}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Roll Number</p>
                  <p className="font-semibold">{selectedTest.rollNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Student</p>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold">{selectedTest.student}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Father's Name</p>
                <p className="font-semibold">{selectedTest.father}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Total Marks</p>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-green-600" />
                    <p className="font-semibold text-lg">{selectedTest.total}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Percentile</p>
                  <p className="font-semibold text-lg text-blue-600">{selectedTest.percentile}%</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Rank</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRankBadge(selectedTest.rank)}`}
                >
                  #{selectedTest.rank}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Subject-wise Marks</p>
                <div className="space-y-2">
                  {selectedTest.subjects.map((subject) => (
                    <div key={subject._id} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                      <span className="font-medium capitalize">{subject.name}</span>
                      <span className="font-semibold">{subject.marks}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
