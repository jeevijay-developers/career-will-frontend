"use client";

import { useState, useMemo } from "react";
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
import { CreditCard, Search, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { FeeRecord } from "./fee-types";
import { getStatusBadge, getStatusIcon, calculateFeeStatus } from "./fee-status-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper function to convert backend status to frontend status
const convertBackendStatus = (backendStatus: "PAID" | "UNPAID" | "PARTIAL"): "paid" | "partial" | "pending" => {
  switch (backendStatus) {
    case "PAID":
      return "paid";
    case "PARTIAL":
      return "partial";
    case "UNPAID":
      return "pending";
    default:
      return "pending";
  }
};

interface FeeRecordsTableProps {
  feeRecords: FeeRecord[];
  onViewDetails: (record: FeeRecord) => void;
  onAddInstallment: (record: FeeRecord) => void;
}

export function FeeRecordsTable({
  feeRecords,
  onViewDetails,
  onAddInstallment,
}: FeeRecordsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Filter records based on search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return feeRecords;
    
    return feeRecords.filter((record) =>
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentRollNo.toString().includes(searchTerm) ||
      record.approvedBy?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [feeRecords, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRecordsPerPageChange = (value: string) => {
    setRecordsPerPage(parseInt(value));
    setCurrentPage(1);
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fee Records
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Show:</span>
              <Select value={recordsPerPage.toString()} onValueChange={handleRecordsPerPageChange}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, roll number..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-[250px] md:w-[300px]"
              />
            </div>
          </div>
        </div>
        {/* Search results info */}
        <div className="text-sm text-muted-foreground">
          {filteredRecords.length === feeRecords.length 
            ? `Showing ${feeRecords.length} records`
            : `Showing ${filteredRecords.length} of ${feeRecords.length} records`
          }
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Final Fee</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? `No records found for "${searchTerm}"` : "No fee records found"}
                  </TableCell>
                </TableRow>
              ) : (
                currentRecords.map((record) => {
                const remainingAmount = record.finalFees - record.paidAmount;
                // Use backend status if available, otherwise calculate
                const status = record.status 
                  ? convertBackendStatus(record.status)
                  : calculateFeeStatus(record.finalFees, record.paidAmount);

                return (
                  <TableRow key={record._id} className={record.paidAmount === 0 ? "bg-yellow-50" : ""}>
                    <TableCell className="font-medium">
                      {record.studentRollNo}
                      {record.paidAmount === 0 && (
                        <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{record.studentName}</TableCell>
                    <TableCell>₹{record.finalFees}</TableCell>
                    <TableCell>₹{record.paidAmount}</TableCell>
                    <TableCell>₹{remainingAmount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span className={getStatusBadge(status)}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="flex gap-2 flex-col">
                      {/* Show Add Payment button only if there's remaining balance */}
                      {status !== "paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddInstallment(record)}
                          className="bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
                        >
                          Add Payment
                        </Button>
                      )}
                      
                      {/* Always show View Details */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(record)}
                        className="mt-1"
                      >
                        View Details
                      </Button>

                      {/* Show submissions count if any */}
                      {record.submissions && record.submissions.length > 0 && (
                        <span className="text-xs text-gray-500 mt-1">
                          {record.submissions.length} payment(s) made
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} 
              {filteredRecords.length > 0 && (
                <span className="ml-2">
                  ({startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {/* Page numbers */}
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
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
