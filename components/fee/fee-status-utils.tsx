import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

export type FeeStatus = "paid" | "partial" | "pending";
export type BackendFeeStatus = "PAID" | "UNPAID" | "PARTIAL";

export const getStatusBadge = (status: FeeStatus): string => {
  const baseClasses = "px-2 py-1 rounded-full text-sm font-medium";
  switch (status) {
    case "paid":
      return `${baseClasses} bg-green-100 text-green-800`;
    case "partial":
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case "pending":
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return baseClasses;
  }
};

export const getStatusIcon = (status: FeeStatus): React.ReactElement | null => {
  switch (status) {
    case "paid":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "partial":
    case "pending":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    default:
      return null;
  }
};

export const calculateFeeStatus = (finalFees: number, paidAmount: number): FeeStatus => {
  const remainingAmount = finalFees - paidAmount;
  if (remainingAmount === 0) return "paid";
  if (paidAmount > 0) return "partial";
  return "pending";
};

// Convert backend status to frontend status
export const convertBackendStatus = (backendStatus: BackendFeeStatus): FeeStatus => {
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
