export interface FeeRecord {
  _id: string;
  studentRollNo: number;
  studentName?: string; // Optional since backend might not always include it
  totalFees: number;
  discount: number;
  finalFees: number;
  approvedBy: string;
  paidAmount: number;
  dueDate: string;
  pendingAmount: number;
  status: "PAID" | "UNPAID" | "PARTIAL";
  submissions: FeeSubmission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FeeSubmission {
  amount: number;
  mode: string;
  dateOfReceipt: string;
  receiptNumber: string;
  UTR?: string;
}

// For simple fee record creation (legacy)
export interface SimpleFeeFormData {
  studentName: string;
  rollNumber: string;
  totalFee: string;
  installmentAmount: string;
  dueDate: string;
}

// For comprehensive fee creation with first installment
export interface FeeFormData {
  studentRollNo: string;
  totalFees: string;
  discount: string;
  approvedBy: string;
  dueDate: string;
  // First installment details
  firstInstallmentAmount: string;
  firstInstallmentMode: string;
  firstInstallmentDateOfReceipt: string;
  firstInstallmentUTR: string;
}

export interface PaymentData {
  paidAmount: string;
  paymentDate: string;
  dateOfReceipt: string;
  receiptNumber: string;
  UTR: string;
  mode: string;
}

export type FeeStatus = "paid" | "partial" | "pending";
