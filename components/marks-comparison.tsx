"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, TrendingUp, TrendingDown, Search } from "lucide-react"

interface StudentMarks {
  id: string
  rollNumber: string
  studentName: string
  batch: string
  physics: number
  chemistry: number
  mathematics: number
  total: number
  average: number
  rank: number
}

const mockMarksData: StudentMarks[] = [
  {
    id: "1",
    rollNumber: "NEET001",
    studentName: "Rahul Sharma",
    batch: "NEET-2024-A",
    physics: 85,
    chemistry: 78,
    mathematics: 92,
    total: 255,
    average: 85,
    rank: 2,
  },
  {
    id: "2",
    rollNumber: "NEET002",
    studentName: "Priya Patel",
    batch: "NEET-2024-B",
    physics: 90,
    chemistry: 88,
    mathematics: 85,
    total: 263,
    average: 87.7,
    rank: 1,
  },
  {
    id: "3",
    rollNumber: "NEET003",
    studentName: "Amit Kumar",
    batch: "NEET-2024-A",
    physics: 75,
    chemistry: 82,
    mathematics: 88,
    total: 245,
    average: 81.7,
    rank: 3,
  },
  {
    id: "4",
    rollNumber: "NEET004",
    studentName: "Sneha Singh",
    batch: "NEET-2024-B",
    physics: 88,
    chemistry: 75,
    mathematics: 80,
    total: 243,
    average: 81,
    rank: 4,
  },
]

export function MarksComparison() {
  const [marksData, setMarksData] = useState<StudentMarks[]>(mockMarksData)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("all")
  const [sortBy, setSortBy] = useState("rank")

  const filteredData = marksData
    .filter((student) => {
      const matchesSearch =
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBatch = selectedBatch === "all" || student.batch === selectedBatch
      return matchesSearch && matchesBatch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rank":
          return a.rank - b.rank
        case "total":
          return b.total - a.total
        case "physics":
          return b.physics - a.physics
        case "chemistry":
          return b.chemistry - a.chemistry
        case "mathematics":
          return b.mathematics - a.mathematics
        default:
          return a.rank - b.rank
      }
    })

  const getSubjectStats = (subject: keyof Pick<StudentMarks, "physics" | "chemistry" | "mathematics">) => {
    const marks = filteredData.map((student) => student[subject])
    const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length
    const highest = Math.max(...marks)
    const lowest = Math.min(...marks)
    return { average: Math.round(average * 10) / 10, highest, lowest }
  }

  const physicsStats = getSubjectStats("physics")
  const chemistryStats = getSubjectStats("chemistry")
  const mathsStats = getSubjectStats("mathematics")

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-200"
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  const getPerformanceIcon = (marks: number, average: number) => {
    if (marks > average) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marks Comparison</h1>
        <p className="text-gray-600">Compare student performance across Physics, Chemistry, and Mathematics</p>
      </div>

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
              Mathematics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average:</span>
                <span className="font-medium">{mathsStats.average}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Highest:</span>
                <span className="font-medium text-green-600">{mathsStats.highest}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Lowest:</span>
                <span className="font-medium text-red-600">{mathsStats.lowest}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Student Performance Comparison
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  <SelectItem value="NEET-2024-A">NEET-2024-A</SelectItem>
                  <SelectItem value="NEET-2024-B">NEET-2024-B</SelectItem>
                  <SelectItem value="NEET-2024-C">NEET-2024-C</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Rank</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-center">Physics</TableHead>
                  <TableHead className="text-center">Chemistry</TableHead>
                  <TableHead className="text-center">Mathematics</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium border ${getRankBadge(student.rank)}`}
                      >
                        #{student.rank}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{student.rollNumber}</TableCell>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{student.batch}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-medium">{student.physics}</span>
                        {getPerformanceIcon(student.physics, physicsStats.average)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-medium">{student.chemistry}</span>
                        {getPerformanceIcon(student.chemistry, chemistryStats.average)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-medium">{student.mathematics}</span>
                        {getPerformanceIcon(student.mathematics, mathsStats.average)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold">{student.total}</TableCell>
                    <TableCell className="text-center font-medium">{student.average}</TableCell>
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
