"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const UploadWarning: React.FC = () => {
  return (
    <Alert className="border-purple-200 bg-purple-50">
      <AlertTriangle className="h-4 w-4 text-purple-600" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="text-purple-800 font-medium">
            Important: Fee Installment Data Format Requirements
          </p>
          <ul className="text-sm text-purple-700 list-disc list-inside space-y-1">
            <li>
              Excel file must contain valid roll numbers and fee installment
              data
            </li>
            <li>
              Each row must have consistent fee structure and payment details
            </li>
            <li>
              Ensure roll numbers exist in the system for successful updates
            </li>
            <li>Fee amounts should be properly formatted as numbers</li>
            <li>Include installment dates and payment status information</li>
          </ul>
          <p className="text-sm text-purple-600 mt-2">
            Example: Roll numbers that don't exist in the system will be listed
            as NOT_FOUND and skipped.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
