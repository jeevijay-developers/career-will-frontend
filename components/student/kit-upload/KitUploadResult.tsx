"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

interface BulkKitUploadResponse {
  message: string;
  EXISTED_KITS: Array<{ id: string; name: string }>;
  NOT_FOUND_ROLL_NUMBERS: number[];
}

interface KitUploadResultProps {
  result: BulkKitUploadResponse;
}

export const KitUploadResult: React.FC<KitUploadResultProps> = ({ result }) => {
  const hasExistedKits = result.EXISTED_KITS && result.EXISTED_KITS.length > 0;
  const hasNotFoundRollNumbers =
    result.NOT_FOUND_ROLL_NUMBERS && result.NOT_FOUND_ROLL_NUMBERS.length > 0;

  return (
    <div className="space-y-4">
      {/* Success Message */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <p className="text-green-800 font-medium">{result.message}</p>
        </AlertDescription>
      </Alert>

      {/* Existed Kits Info */}
      {hasExistedKits && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-blue-800 font-medium">
                Existing Kits Found ({result.EXISTED_KITS.length})
              </p>
              <p className="text-sm text-blue-700">
                The following kits already exist in the system:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.EXISTED_KITS.slice(0, 10).map((kit) => (
                  <span
                    key={kit.id}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    {kit.name}
                  </span>
                ))}
                {result.EXISTED_KITS.length > 10 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    +{result.EXISTED_KITS.length - 10} more
                  </span>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Not Found Roll Numbers Warning */}
      {hasNotFoundRollNumbers && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-orange-800 font-medium">
                Students Not Found ({result.NOT_FOUND_ROLL_NUMBERS.length})
              </p>
              <p className="text-sm text-orange-700">
                The following roll numbers were not found in the system:
              </p>
              <div className="max-h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.NOT_FOUND_ROLL_NUMBERS.slice(0, 20).map((rollNo) => (
                    <span
                      key={rollNo}
                      className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded text-xs"
                    >
                      {rollNo}
                    </span>
                  ))}
                  {result.NOT_FOUND_ROLL_NUMBERS.length > 20 && (
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">
                      +{result.NOT_FOUND_ROLL_NUMBERS.length - 20} more
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-orange-600 mt-2">
                Kits were not assigned to these students as they don't exist in
                the database.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
