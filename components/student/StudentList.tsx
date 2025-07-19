"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2 } from "lucide-react"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { EditStudentForm } from "./EditStudentForm"

interface Student {
  id: string
  studentId: number
  name: string
  rollNo: string
  class: string
  kit: string[]
  parent: {
    id: string
    username: string
    name: string
    email: string
    phone: string
  }
  joinDate: string
}

interface Kit {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface StudentListProps {
  students: Student[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  batchNames: { [key: string]: string };
  kits: Kit[];
  batches: any[];
  onStudentUpdated: () => void;
}

export function StudentList({
  students,
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  batchNames,
  kits,
  batches,
  onStudentUpdated
}: StudentListProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Sort students in ascending order by name before filtering
  const sortedStudents = [...students].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const lowerSearch = searchTerm.toLowerCase();

  const filteredStudents = sortedStudents.filter((student: any) => {
    const batchName =
      typeof student.class === "string"
        ? student.class
        : batchNames[student.batch] || "No batch allotted";

    const searchableFields = [
      student.name,
      student.rollNo?.toString(),
      student.parent?.name,
      student.parent?.email,
      student.parent?.phone,
      student.class,
      batchName,
    ];

    return searchableFields.some(
      (field) => field?.toLowerCase().includes(lowerSearch)
    );
  });

  const handleDelete = () => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this item?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            alert('Item deleted!');
          }
        },
        {
          label: 'No',
          onClick: () => {
            console.log('Deletion cancelled');
          }
        }
      ]
    });
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedStudent(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Students List</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S No.</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Parent Name</TableHead>
                <TableHead>Parent Email</TableHead>
                <TableHead>Parent Phone</TableHead>
                <TableHead>Kits</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, i) => (
                  <TableRow key={student.id || i}>
                    <TableCell className="font-medium">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                    <TableCell className="font-medium">{student.rollNo ?? "-"}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {typeof student.class === "string" && student.class
                          ? student.class
                          : (student as any).batch && batchNames[(student as any).batch]
                            ? batchNames[(student as any).batch]
                            : "No batch allotted"}
                      </span>
                    </TableCell>
                    <TableCell>{student.parent?.name ?? student.parent?.username ?? "-"}</TableCell>
                    <TableCell>{student.parent?.email ?? "-"}</TableCell>
                    <TableCell>{student.parent?.phone ?? "-"}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">{student.kit?.length ?? 0} / {(kits ?? []).length}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={handleDelete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No students found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* Pagination Controls */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
              Previous
            </Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Student Modal */}
      <EditStudentForm
        isOpen={isEditDialogOpen}
        onClose={handleCloseEdit}
        student={selectedStudent}
        kits={kits}
        batches={batches}
        onStudentUpdated={onStudentUpdated}
      />
    </Card>
  )
}
