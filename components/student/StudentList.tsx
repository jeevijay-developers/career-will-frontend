"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Edit, Trash2 } from "lucide-react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { EditStudentForm } from "./EditStudentForm";
import { searchStudent } from "../../server/server";
import toast from "react-hot-toast";

interface Student {
  id: string;
  studentId: number;
  name: string;
  rollNo: string;
  class: string;
  batch?: string;
  kit: string[];
  parent: {
    id: string;
    username: string;
    name: string;
    email: string;
    phone: string;
  };
  joinDate: string;
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
  onStudentUpdated,
}: StudentListProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);
      
      try {
        const result = await searchStudent(searchQuery.trim());
        console.log("Search result:", result); // Debug log
        
        // Handle the response - backend returns array directly, not wrapped in data property
        if (result && Array.isArray(result)) {
          setSearchResults(result);
          if (result.length === 0) {
            setSearchError("No students found");
          }
        } else if (result) {
          // In case backend returns a single student object
          setSearchResults([result]);
        } else {
          setSearchResults([]);
          setSearchError("No students found");
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setSearchError("Search failed. Please try again.");
        toast.error("Failed to search students");
      } finally {
        setIsSearching(false);
      }
    }, 800), // 800ms delay
    []
  );

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setLocalSearchTerm(value);
    onSearchChange(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      setSearchError(null);
      debouncedSearch.cancel(); // Cancel pending search
      return;
    }
    
    // Start debounced search
    debouncedSearch(value);
  };

  // Handle Enter key press for immediate search
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      debouncedSearch.cancel(); // Cancel any pending debounced search
      
      if (localSearchTerm.trim()) {
        // Immediately execute search
        handleImmediateSearch(localSearchTerm.trim());
      }
    }
  };

  // Immediate search function for Enter key
  const handleImmediateSearch = async (searchQuery: string) => {
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const result = await searchStudent(searchQuery);
      console.log("Immediate search result:", result); // Debug log
      
      // Handle the response - backend returns array directly, not wrapped in data property
      if (result && Array.isArray(result)) {
        setSearchResults(result);
        if (result.length === 0) {
          setSearchError("No students found");
        }
      } else if (result) {
        // In case backend returns a single student object
        setSearchResults([result]);
      } else {
        setSearchResults([]);
        setSearchError("No students found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSearchError("Search failed. Please try again.");
      toast.error("Failed to search students");
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search results when search term is cleared
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError(null);
    }
  }, [searchTerm]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Determine which student list to use
  const studentsToDisplay = searchTerm.trim() ? searchResults : students;

  // Sort students in ascending order by name before filtering
  const sortedStudents = [...studentsToDisplay].sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  console.log(students);

  const lowerSearch = searchTerm.toLowerCase();

  // For API search results, don't apply additional filtering since API already filtered
  // For regular students list, apply client-side filtering as before
  const filteredStudents = searchTerm.trim() ? sortedStudents : sortedStudents.filter((student: any) => {
    const batchName =
      typeof student.class === "string"
        ? student.class
        : batchNames[student.batch] || "No batch allotted";

    const searchableFields = [
      student.name,
      student.rollNo?.toString(),
      student.parent?.fatherName,
      student.parent?.email,
      student.parent?.parentContact,
      student.class,
      batchName,
    ];

    return searchableFields.some((field) =>
      field?.toLowerCase().includes(lowerSearch)
    );
  });

  const handleDelete = () => {
    confirmAlert({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this student?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            alert("Item deleted!");
          },
        },
        {
          label: "No",
          onClick: () => {
            console.log("Deletion cancelled");
          },
        },
      ],
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

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user_data") || "{}")
      : {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Students List</CardTitle>
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
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
            >
              Next
            </Button>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Enter student's roll number"
              value={localSearchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
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
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} student(s)` 
                  : isSearching 
                    ? 'Searching...' 
                    : 'Press Enter to search or wait for auto-search'}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[60px]">S No.</TableHead>
                <TableHead className="min-w-[80px]">Roll No.</TableHead>
                {user.role === "ADMIN" && (
                  <>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[120px]">Class</TableHead>
                    <TableHead className="min-w-[100px]">Batch</TableHead>
                    <TableHead className="min-w-[150px]">Father Name</TableHead>
                    {/* <TableHead>Parent Email</TableHead> */}
                    <TableHead className="min-w-[120px]">Parent Phone</TableHead>
                    <TableHead className="min-w-[80px]">Kits</TableHead>
                  </>
                )}
                {user.role === "ACCOUNTS" && (
                  <>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[120px]">Class</TableHead>
                    <TableHead className="min-w-[100px]">Batch</TableHead>
                    <TableHead className="min-w-[150px]">Father Name</TableHead>
                    {/* <TableHead>Parent Email</TableHead> */}
                    <TableHead className="min-w-[120px]">Parent Phone</TableHead>
                    <TableHead className="min-w-[80px]">Kits</TableHead>
                  </>
                )}
                {user.role === "STORE" && <TableHead className="min-w-[100px]">Batch</TableHead>}
                {user.role === "FRONTDESK" && <TableHead className="min-w-[100px]">Batch</TableHead>}
                {(user.role === "ADMIN" ||
                  user.role === "FRONTDESK" ||
                  user.role === "STORE") && <TableHead className="min-w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student: any, i) => (
                  <TableRow key={student.id || i}>
                    <TableCell className="font-medium min-w-[60px]">
                      {(currentPage - 1) * pageSize + i + 1}
                    </TableCell>
                    <TableCell className="font-medium min-w-[80px]">
                      {student.rollNo ?? "-"}
                    </TableCell>
                    {user.role === "ADMIN" && (
                      <>
                        <TableCell className="min-w-[150px]">{student.name}</TableCell>
                        <TableCell className="min-w-[120px]">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {student.class || "No batch allotted"}
                          </span>
                        </TableCell>
                        <TableCell className="min-w-[100px]">{student.batch || "-"}</TableCell>
                        <TableCell className="min-w-[150px]">
                          {student.parent?.fatherName ??
                            student.parent?.fatherName ??
                            "-"}
                        </TableCell>
                        {/* <TableCell>{student.parent?.email ?? "-"}</TableCell> */}
                        <TableCell className="min-w-[120px]">
                          {student.parent?.parentContact ?? "-"}
                        </TableCell>
                        <TableCell className="min-w-[80px]">
                          <span className="text-sm text-gray-700">
                            {student.kit?.length ?? 0} / {(kits ?? []).length}
                          </span>
                        </TableCell>
                      </>
                    )}
                    {user.role === "ACCOUNTS" && (
                      <>
                        <TableCell className="min-w-[150px]">{student.name}</TableCell>
                        <TableCell className="min-w-[120px]">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {student.class || "No batch allotted"}
                          </span>
                        </TableCell>
                        <TableCell className="min-w-[100px]">{student.batch || "-"}</TableCell>
                        <TableCell className="min-w-[150px]">
                          {student.parent?.fatherName ??
                            student.parent?.fatherName ??
                            "-"}
                        </TableCell>
                        {/* <TableCell>{student.parent?.email ?? "-"}</TableCell> */}
                        <TableCell className="min-w-[120px]">
                          {student.parent?.parentContact ?? "-"}
                        </TableCell>
                        <TableCell className="min-w-[80px]">
                          <span className="text-sm text-gray-700">
                            {student.kit?.length ?? 0} / {(kits ?? []).length}
                          </span>
                        </TableCell>
                      </>
                    )}
                    {user.role === "STORE" && (
                      <TableCell className="min-w-[100px]">{student.batch || "-"}</TableCell>
                    )}
                    {user.role === "FRONTDESK" && (
                      <TableCell className="min-w-[100px]">{student.batch || "-"}</TableCell>
                    )}
                    {(user.role === "ADMIN" ||
                      user.role === "FRONTDESK" ||
                      user.role === "STORE") && (
                      <TableCell className="min-w-[100px]">
                        <div className="flex gap-2">
                          {user.role === "ADMIN" && (
                            <>
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
                            </>
                          )}
                          {user.role === "FRONTDESK" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(student)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {/* If STORE should have actions, add here */}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      user.role === "ADMIN"
                        ? 10
                        : user.role === "ACCOUNTS"
                        ? 8
                        : user.role === "STORE"
                        ? 3
                        : 3
                    }
                    className="text-center py-8 text-gray-500"
                  >
                    {searchTerm.trim() ? (
                      searchError ? (
                        <div>
                          <p className="text-red-500">{searchError}</p>
                          <p className="text-sm text-gray-400 mt-1">Try searching with a different roll number</p>
                        </div>
                      ) : (
                        "Searching..."
                      )
                    ) : (
                      "No students found"
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debouncedFunc = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  }) as T & { cancel: () => void };
  
  debouncedFunc.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debouncedFunc;
}
