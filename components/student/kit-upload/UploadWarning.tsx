"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const UploadWarning: React.FC = () => {
  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="text-yellow-800 font-medium">
            Important: Kit Data Format Requirements
          </p>
          <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
            <li>Every row must contain the same number and type of kits</li>
            <li>Kit columns should be consistent across all student records</li>
            <li>Use the same kit names throughout the file</li>
            <li>Empty kit fields may cause upload errors</li>
          </ul>
          <p className="text-sm text-yellow-600 mt-2">
            Example: If row 1 has "t-shirt, bag, bottle", all other rows should
            follow the same kit pattern.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
