"use client";

import { useState } from "react";
import { StudentForm } from "./StudentForm";
import { StudentList } from "./StudentList";
import { useStudentData } from "./useStudentData";
import BulkUploadButton from "./BulkUpload";

export function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const {
    students,
    currentPage,
    totalPages,
    pageSize,
    kits,
    batches,
    batchNames,
    setCurrentPage,
    refreshStudents,
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
          <h1 className="text-3xl font-bold text-gray-900">
            Student Management
          </h1>
          <p className="text-gray-600">
            Manage NEET students and their information
          </p>
        </div>

        <div className="flex gap-3">
          <BulkUploadButton
            viewModal={isBulkUploadOpen}
            setModal={setIsBulkUploadOpen}
            onUploadSuccess={handleStudentAdded}
          />
          {/* <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            onClick={() => setIsAddDialogOpen(true)}
            type="button"
          >
            <span className="mr-2">+</span> Add Student
          </button> */}
          <StudentForm
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            kits={kits}
            batches={batches}
            onStudentAdded={handleStudentAdded}
          />
        </div>
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
        batches={batches}
        onStudentUpdated={handleStudentAdded}
      />
    </div>
  );
}
