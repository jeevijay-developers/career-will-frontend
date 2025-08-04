"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FeeRecord } from "./fee-types";
import { getStatusBadge, calculateFeeStatus } from "./fee-status-utils";

interface FeeDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudent: FeeRecord | null;
}

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

export function FeeDetailsDialog({
  isOpen,
  onOpenChange,
  selectedStudent,
}: FeeDetailsDialogProps) {
  if (!selectedStudent) return null;

  const remainingAmount = selectedStudent.finalFees - selectedStudent.paidAmount;
  const status = selectedStudent.status 
    ? convertBackendStatus(selectedStudent.status)
    : calculateFeeStatus(selectedStudent.finalFees, selectedStudent.paidAmount);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fee Details - {selectedStudent.studentName || `Student ${selectedStudent.studentRollNo}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Student Name:</span>
                  <p className="font-semibold">{selectedStudent.studentName || `Student ${selectedStudent.studentRollNo}`}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Roll Number:</span>
                  <p className="font-semibold">{selectedStudent.studentRollNo}</p>
                </div>
                {selectedStudent.approvedBy && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Approved By:</span>
                    <p className="font-semibold">{selectedStudent.approvedBy}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Due Date:</span>
                  <p className="font-semibold">
                    {new Date(selectedStudent.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fee Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Fees:</span>
                    <span className="font-semibold">₹{selectedStudent.totalFees?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-semibold text-green-600">
                      -₹{selectedStudent.discount?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Final Fees:</span>
                  <span className="font-bold">₹{selectedStudent.finalFees.toLocaleString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid Amount:</span>
                    <span className="font-semibold text-green-600">
                      ₹{selectedStudent.paidAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining Amount:</span>
                    <span className={`font-semibold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{remainingAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status:</span>
                  <Badge className={getStatusBadge(status)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {selectedStudent.submissions && selectedStudent.submissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedStudent.submissions.map((submission, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <p className="font-semibold">₹{submission.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Mode:</span>
                          <p className="font-semibold">{submission.mode}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <p className="font-semibold">
                            {new Date(submission.dateOfReceipt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Receipt No:</span>
                          <p className="font-semibold">{submission.receiptNumber}</p>
                        </div>
                        {submission.UTR && (
                          <div className="col-span-2">
                            <span className="text-gray-600">UTR:</span>
                            <p className="font-semibold">{submission.UTR}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Payment History Message */}
          {(!selectedStudent.submissions || selectedStudent.submissions.length === 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-4">No payments recorded yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
