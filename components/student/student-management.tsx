"use client";

import { useState } from "react";
import { StudentForm } from "./StudentForm";
import { StudentList } from "./StudentList";
import { useStudentData } from "./useStudentData";
import BulkUploadButton from "./BulkUpload";
import BulkKitUploadButton from "./BulkKitUpload";
import BulkFeeUploadButton from "./BulkFeeUpload";
import { ExportDetailsButton } from "./ExportDetailsButton";
import { StudentFilter } from "./StudentFilter";

export function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isBulkKitUploadOpen, setIsBulkKitUploadOpen] = useState(false);
  const [isBulkFeeUploadOpen, setIsBulkFeeUploadOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [isFiltered, setIsFiltered] = useState(false);

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

  const handleExportSuccess = () => {
    // Optional: You can add any post-export logic here
    console.log("Export completed successfully");
  };

  const handleFilterResults = (results: any) => {
    setFilteredData(results);
    setIsFiltered(true);
  };

  const handleClearFilter = () => {
    setFilteredData(null);
    setIsFiltered(false);
    refreshStudents(); // Refresh the original student data
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

        <div className="flex gap-3 flex-wrap">
          <BulkUploadButton
            viewModal={isBulkUploadOpen}
            setModal={setIsBulkUploadOpen}
            onUploadSuccess={handleStudentAdded}
          />
          <BulkKitUploadButton
            viewModal={isBulkKitUploadOpen}
            setModal={setIsBulkKitUploadOpen}
            onUploadSuccess={handleStudentAdded}
          />
          <BulkFeeUploadButton
            viewModal={isBulkFeeUploadOpen}
            setModal={setIsBulkFeeUploadOpen}
            onUploadSuccess={handleStudentAdded}
          />
          <ExportDetailsButton onExportSuccess={handleExportSuccess} />
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

      <StudentFilter
        onFilterResults={handleFilterResults}
        onClearFilter={handleClearFilter}
        currentPage={currentPage}
        pageSize={pageSize}
      />

      <StudentList
        students={isFiltered ? filteredData?.data || [] : students}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentPage={
          isFiltered ? filteredData?.pagination?.page || 1 : currentPage
        }
        totalPages={
          isFiltered ? filteredData?.pagination?.totalPages || 1 : totalPages
        }
        pageSize={pageSize}
        onPageChange={handlePageChange}
        batchNames={batchNames}
        kits={kits}
        batches={batches}
        onStudentUpdated={handleStudentAdded}
        isFiltered={isFiltered}
        totalRecords={
          isFiltered ? filteredData?.pagination?.total || 0 : undefined
        }
      />
    </div>
  );
}
