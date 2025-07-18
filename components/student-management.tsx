"use client"

import { useState } from "react"
import { StudentForm } from "./student/StudentForm"
import { StudentList } from "./student/StudentList"
import { useStudentData } from "./student/useStudentData"

export function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const {
    students,
    currentPage,
    totalPages,
    pageSize,
    kits,
    batches,
    batchNames,
    isLoading,
    setCurrentPage,
    refreshStudents
  } = useStudentData();

  const handleStudentAdded = () => {
    refreshStudents();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Manage JEE students and their information</p>
        </div>
        <StudentForm
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          kits={kits}
          batches={batches}
          onStudentAdded={handleStudentAdded}
        />
      </div>

      <StudentList
        students={students}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        batchNames={batchNames}
        kits={kits}
      />
    </div>
  )
}