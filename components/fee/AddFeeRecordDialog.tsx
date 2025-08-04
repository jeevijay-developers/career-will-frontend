"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { FeeFormData } from "./fee-types";

interface AddFeeRecordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FeeFormData) => Promise<void>;
}

export function AddFeeRecordDialog({
  isOpen,
  onOpenChange,
  onSubmit,
}: AddFeeRecordDialogProps) {
  const [formData, setFormData] = useState<FeeFormData>({
    studentRollNo: "",
    totalFees: "",
    discount: "0",
    approvedBy: "",
    dueDate: "",
    firstInstallmentAmount: "",
    firstInstallmentMode: "CASH",
    firstInstallmentDateOfReceipt: new Date().toISOString().split('T')[0],
    firstInstallmentUTR: "",
  });

  const [calculatedFinalFees, setCalculatedFinalFees] = useState<number>(0);

  // Calculate final fees when total fees or discount changes
  const handleTotalFeesChange = (value: string) => {
    const total = parseFloat(value) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const final = total - discount;
    setCalculatedFinalFees(final);
    setFormData({ ...formData, totalFees: value });
  };

  const handleDiscountChange = (value: string) => {
    const total = parseFloat(formData.totalFees) || 0;
    const discount = parseFloat(value) || 0;
    const final = total - discount;
    setCalculatedFinalFees(final);
    setFormData({ ...formData, discount: value });
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
    // Reset form after successful submission
    setFormData({
      studentRollNo: "",
      totalFees: "",
      discount: "0",
      approvedBy: "",
      dueDate: "",
      firstInstallmentAmount: "",
      firstInstallmentMode: "CASH",
      firstInstallmentDateOfReceipt: new Date().toISOString().split('T')[0],
      firstInstallmentUTR: "",
    });
    setCalculatedFinalFees(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Fee Record
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Fee Record with First Installment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Fee Structure Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Structure</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentRollNo">Student Roll Number</Label>
                <Input
                  id="studentRollNo"
                  type="number"
                  value={formData.studentRollNo}
                  onChange={(e) =>
                    setFormData({ ...formData, studentRollNo: e.target.value })
                  }
                  placeholder="Student roll number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="totalFees">Total Fees (₹)</Label>
                <Input
                  id="totalFees"
                  type="number"
                  value={formData.totalFees}
                  onChange={(e) => handleTotalFeesChange(e.target.value)}
                  placeholder="Total fee amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (₹)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  placeholder="Discount amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="finalFees">Final Fees (₹)</Label>
                <div className="p-2 bg-gray-100 rounded border text-lg font-semibold text-green-700">
                  ₹{calculatedFinalFees.toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvedBy">Approved By</Label>
                <Input
                  id="approvedBy"
                  value={formData.approvedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, approvedBy: e.target.value })
                  }
                  placeholder="Approved by (name)"
                />
              </div>
            </div>
          </div>

          {/* First Installment Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">First Installment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstInstallmentAmount">Installment Amount (₹)</Label>
                <Input
                  id="firstInstallmentAmount"
                  type="number"
                  value={formData.firstInstallmentAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, firstInstallmentAmount: e.target.value })
                  }
                  placeholder="First installment amount"
                  max={calculatedFinalFees}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstInstallmentMode">Payment Mode</Label>
                <select
                  id="firstInstallmentMode"
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  value={formData.firstInstallmentMode}
                  onChange={(e) =>
                    setFormData({ ...formData, firstInstallmentMode: e.target.value })
                  }
                >
                  <option value="CASH">Cash</option>
                  <option value="ONLINE">Online</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="firstInstallmentDateOfReceipt">Date of Receipt</Label>
                <Input
                  id="firstInstallmentDateOfReceipt"
                  type="date"
                  value={formData.firstInstallmentDateOfReceipt}
                  onChange={(e) =>
                    setFormData({ ...formData, firstInstallmentDateOfReceipt: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstInstallmentUTR">UTR/Transaction Number</Label>
                <Input
                  id="firstInstallmentUTR"
                  value={formData.firstInstallmentUTR}
                  onChange={(e) =>
                    setFormData({ ...formData, firstInstallmentUTR: e.target.value })
                  }
                  placeholder="UTR or transaction number (optional)"
                />
              </div>
            </div>
          </div>

          {/* Summary Section */}
          {formData.firstInstallmentAmount && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Payment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Final Fees:</span>
                  <span className="ml-2 font-medium">₹{calculatedFinalFees.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">First Installment:</span>
                  <span className="ml-2 font-medium">₹{parseFloat(formData.firstInstallmentAmount || "0").toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Remaining Amount:</span>
                  <span className="ml-2 font-medium text-red-600">
                    ₹{(calculatedFinalFees - parseFloat(formData.firstInstallmentAmount || "0")).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium text-yellow-600">PARTIAL</span>
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
            disabled={!formData.studentRollNo || !formData.totalFees || !formData.firstInstallmentAmount}
          >
            Create Fee Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
