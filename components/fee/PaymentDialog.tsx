"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeeRecord, PaymentData } from "./fee-types";

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudent: FeeRecord | null;
  onSubmit: (paymentData: PaymentData, studentRollNo: number) => Promise<void>;
}

export function PaymentDialog({
  isOpen,
  onOpenChange,
  selectedStudent,
  onSubmit,
}: PaymentDialogProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    paidAmount: "",
    paymentDate: "",
    dateOfReceipt: "",
    receiptNumber: "",
    UTR: "",
    mode: "CASH",
  });

  // Reset form when dialog opens/closes or student changes
  useEffect(() => {
    if (!isOpen) {
      setPaymentData({
        paidAmount: "",
        paymentDate: "",
        dateOfReceipt: "",
        receiptNumber: "",
        UTR: "",
        mode: "CASH",
      });
    } else {
      // Set default date when dialog opens
      setPaymentData({
        paidAmount: "",
        paymentDate: "",
        dateOfReceipt: new Date().toISOString().split('T')[0],
        receiptNumber: "",
        UTR: "",
        mode: "CASH",
      });
    }
  }, [isOpen, selectedStudent]);

  const handleSubmit = async () => {
    if (!selectedStudent) return;
    
    await onSubmit(paymentData, selectedStudent.studentRollNo);
    onOpenChange(false);
  };

  if (!selectedStudent) return null;

  const remainingAmount = selectedStudent.finalFees - selectedStudent.paidAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Payment Installment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Student Information */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Student Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Name:</span>
                <p className="font-medium text-blue-900">{selectedStudent.studentName || `Student ${selectedStudent.studentRollNo}`}</p>
              </div>
              <div>
                <span className="text-blue-600">Roll Number:</span>
                <p className="font-medium text-blue-900">{selectedStudent.studentRollNo}</p>
              </div>
              <div>
                <span className="text-blue-600">Total Fees:</span>
                <p className="font-medium text-blue-900">₹{selectedStudent.finalFees.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-blue-600">Paid Amount:</span>
                <p className="font-medium text-blue-900">₹{selectedStudent.paidAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-blue-600">Remaining:</span>
                <p className="font-medium text-red-600">₹{remainingAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-blue-600">Status:</span>
                <p className="font-medium text-yellow-600">{selectedStudent.status}</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Payment Details</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentData.paidAmount}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      paidAmount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                  max={remainingAmount}
                />
                <p className="text-xs text-gray-500">
                  Maximum amount: ₹{remainingAmount.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="mode"
                    id="paymentMode"
                    value={paymentData.mode}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, mode: e.target.value })
                    }
                  >
                    <option value="CASH">Cash</option>
                    <option value="ONLINE">Online</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfReceipt">Date Of Receipt</Label>
                  <Input
                    id="dateOfReceipt"
                    type="date"
                    value={paymentData.dateOfReceipt}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        dateOfReceipt: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiptNumber">Receipt Number</Label>
                  <Input
                    id="receiptNumber"
                    value={paymentData.receiptNumber}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        receiptNumber: e.target.value,
                      })
                    }
                    placeholder="Receipt number"
                  />
                </div>
                
                {(paymentData.mode === "ONLINE" || paymentData.mode === "CARD") && (
                  <div className="space-y-2">
                    <Label htmlFor="utrNumber">UTR/Transaction Number</Label>
                    <Input
                      id="utrNumber"
                      value={paymentData.UTR}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          UTR: e.target.value,
                        })
                      }
                      placeholder="UTR or transaction number"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {paymentData.paidAmount && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Payment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current Payment:</span>
                  <span className="ml-2 font-medium">₹{parseFloat(paymentData.paidAmount || "0").toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total After Payment:</span>
                  <span className="ml-2 font-medium">₹{(selectedStudent.paidAmount + parseFloat(paymentData.paidAmount || "0")).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">New Remaining:</span>
                  <span className="ml-2 font-medium text-red-600">
                    ₹{(remainingAmount - parseFloat(paymentData.paidAmount || "0")).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">New Status:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {(remainingAmount - parseFloat(paymentData.paidAmount || "0")) <= 0 ? "PAID" : "PARTIAL"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!paymentData.paidAmount || !paymentData.dateOfReceipt || !paymentData.receiptNumber}
          >
            Add Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
