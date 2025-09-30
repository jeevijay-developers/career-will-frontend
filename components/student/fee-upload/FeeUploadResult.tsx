"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

interface BulkFeeUploadResponse {
  message: string;
  updatedCount: number;
  NOT_FOUND_ROLL_NUMBERS: number[];
}

interface FeeUploadResultProps {
  result: BulkFeeUploadResponse;
}

export const FeeUploadResult: React.FC<FeeUploadResultProps> = ({ result }) => {
  const hasNotFoundRollNumbers =
    result.NOT_FOUND_ROLL_NUMBERS && result.NOT_FOUND_ROLL_NUMBERS.length > 0;

  return (
    <div className="space-y-4">
      {/* Success Message */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <div className="space-y-1">
            <p className="text-green-800 font-medium">{result.message}</p>
            <p className="text-sm text-green-700">
              Successfully updated {result.updatedCount} fee installment
              records.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Not Found Roll Numbers Warning */}
      {hasNotFoundRollNumbers && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-orange-800 font-medium">
                Roll Numbers Not Found ({result.NOT_FOUND_ROLL_NUMBERS.length})
              </p>
              <p className="text-sm text-orange-700">
                The following roll numbers were not found in the system and
                their fee data was not updated:
              </p>
              <div className="max-h-48 overflow-y-auto bg-white rounded p-2 border border-orange-300">
                <div className="flex flex-wrap gap-1">
                  {result.NOT_FOUND_ROLL_NUMBERS.map((rollNo, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded text-xs"
                    >
                      {rollNo}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-orange-600 mt-2">
                Fee installments were not updated for these students as they
                don't exist in the database.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
