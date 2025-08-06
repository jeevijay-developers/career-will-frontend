"use client";

import { useState, useEffect } from "react";
import {
  createFeeSubmission,
  getAllFees,
  updateFeeOfStudent,
} from "../../server/server";
import toast from "react-hot-toast";
import { FeeRecord, FeeFormData, PaymentData } from "./fee-types";
import { AddFeeRecordDialog } from "./AddFeeRecordDialog";
import { PaymentDialog } from "./PaymentDialog";
import { FeeDetailsDialog } from "./FeeDetailsDialog";
import { FeeRecordsTable } from "./FeeRecordsTable";

export function FeeManagement() {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<FeeRecord | null>(null);

  // Fetch all fee records on component mount
  useEffect(() => {
    const fetchFeeRecords = async () => {
      try {
        const response = await getAllFees();
        console.log("Fetched fee records:", response);
        setFeeRecords(response.data);
      } catch (error) {
        console.error("Error fetching fee records:", error);
        toast.error("Failed to fetch fee records");
      }
    };

    fetchFeeRecords();
  }, []);

  const handleAddFeeRecord = async (formData: FeeFormData) => {
    try {
      // Calculate final fees
      const totalFees = parseFloat(formData.totalFees);
      const discount = parseFloat(formData.discount) || 0;
      const finalFees = totalFees - discount;
      const firstInstallmentAmount = parseFloat(formData.firstInstallmentAmount);

      // Prepare fee data according to backend schema
      const feeData = {
        studentRollNo: parseInt(formData.studentRollNo),
        totalFees: totalFees,
        discount: discount,
        finalFees: finalFees,
        approvedBy: formData.approvedBy,
        paidAmount: firstInstallmentAmount,
        dueDate: new Date(formData.dueDate).toISOString(),
        mode: formData.firstInstallmentMode,
        dateOfReceipt: new Date(formData.firstInstallmentDateOfReceipt).toISOString(),
        receiptNumber: `RCPT${Date.now()}`,
        UTR: formData.firstInstallmentUTR || "",
      };

      console.log("Creating fee record with data:", feeData);
      const response = await createFeeSubmission(feeData);

      // Refresh the data from server
      const updatedRecords = await getAllFees();
      setFeeRecords(updatedRecords.data);

      setIsAddDialogOpen(false);
      toast.success("Fee record created successfully!");
    } catch (error) {
      console.error("Error creating fee record:", error);
      toast.error("Failed to create fee record. Please try again.");
    }
  };

  const handlePayment = async (paymentData: PaymentData, studentRollNo: number) => {
    try {
      // For additional installments, we should use a different API endpoint or method
      // For now, using the same createFeeSubmission but with minimal data for installment
      const installmentData = {
        studentRollNo: studentRollNo,
        paidAmount: parseFloat(paymentData.paidAmount),
        mode: paymentData.mode,
        dateOfReceipt: paymentData.dateOfReceipt,
        receiptNumber: paymentData.receiptNumber,
        UTR: paymentData.UTR || "",
      };

      console.log("Adding payment installment with data:", installmentData);
      const response = await createFeeSubmission(installmentData);
      
      console.log("Payment data:", response);
      
      // Refresh the data from server
      const updatedRecords = await getAllFees();
      setFeeRecords(updatedRecords);
      
      toast.success("Payment installment added successfully!");
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Failed to submit payment. Please try again.");
    }
  };

  const handleViewDetails = (record: FeeRecord) => {
    setSelectedStudent(record);
    setIsDetailsDialogOpen(true);
  };

  const handleAddInstallment = (record: FeeRecord) => {
    setSelectedStudent(record);
    setIsPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600">
            Track student fees and payment installments
          </p>
        </div>
        <AddFeeRecordDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddFeeRecord}
        />
      </div>

      <FeeRecordsTable
        feeRecords={feeRecords}
        onViewDetails={handleViewDetails}
        onAddInstallment={handleAddInstallment}
      />

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        selectedStudent={selectedStudent}
        onSubmit={handlePayment}
      />

      <FeeDetailsDialog
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        selectedStudent={selectedStudent}
      />
    </div>
  );
}
