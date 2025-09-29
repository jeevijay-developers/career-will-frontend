"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";
import { exportStudentData } from "../../server/server.js";

interface ExportDetailsButtonProps {
  onExportSuccess?: () => void;
}

export function ExportDetailsButton({
  onExportSuccess,
}: ExportDetailsButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rollStart, setRollStart] = useState("");
  const [rollEnd, setRollEnd] = useState("");
  const [includeFeeDetails, setIncludeFeeDetails] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateRange = () => {
    const start = parseInt(rollStart);
    const end = parseInt(rollEnd);

    if (!rollStart || !rollEnd) {
      return "Both roll number start and end are required";
    }

    if (isNaN(start) || isNaN(end)) {
      return "Roll numbers must be valid numbers";
    }

    if (start < 1) {
      return "Roll number start must be at least 1";
    }

    if (end <= start) {
      return "Roll number end must be greater than start";
    }

    const range = end - start + 1;
    if (range > 2500) {
      return "Maximum 2500 records can be exported at once";
    }

    return null;
  };

  const handleExport = async () => {
    const validationError = validateRange();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Use the API abstraction layer
      const blob = await exportStudentData(
        parseInt(rollStart),
        parseInt(rollEnd),
        includeFeeDetails
      );

      // Create download link and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Trigger download (let browser handle filename from server)
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Export completed successfully! File downloaded.");

      if (onExportSuccess) {
        onExportSuccess();
      }

      handleClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Export failed";
      setError(errorMessage);
      toast.error(`Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setRollStart("");
    setRollEnd("");
    setIncludeFeeDetails(false);
    setError(null);
  };

  const getRangeInfo = () => {
    if (rollStart && rollEnd) {
      const start = parseInt(rollStart);
      const end = parseInt(rollEnd);
      if (!isNaN(start) && !isNaN(end) && end > start) {
        const count = end - start + 1;
        const isOverLimit = count > 2500;
        return {
          text: `${count} record(s) will be exported`,
          count,
          isOverLimit,
        };
      }
    }
    return null;
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="outline"
        className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
      >
        <Download className="h-4 w-4" />
        Export Details
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <Download className="h-5 w-5" />
              Export Student Details
            </DialogTitle>
            <DialogDescription>
              Export student data within a specific roll number range. Maximum
              2500 records per export.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Range Limit Warning */}
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="space-y-1">
                  <p className="font-medium">Export Limitations:</p>
                  <ul className="text-sm list-disc list-inside">
                    <li>Maximum 2500 records per export</li>
                    <li>Roll numbers must be valid positive integers</li>
                    <li>End roll number must be greater than start</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Roll Number Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rollStart">Roll Number Start</Label>
                <Input
                  id="rollStart"
                  type="number"
                  min="1"
                  value={rollStart}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setRollStart(newStart);
                    setError(null);

                    // If end is set and would exceed 2500 records, adjust it
                    if (rollEnd && newStart) {
                      const start = parseInt(newStart);
                      const end = parseInt(rollEnd);
                      if (!isNaN(start) && !isNaN(end)) {
                        const range = end - start + 1;
                        if (range > 2500) {
                          const maxEnd = start + 2499;
                          setRollEnd(maxEnd.toString());
                          toast(
                            `End roll number adjusted to ${maxEnd} to stay within 2500 record limit`,
                            {
                              icon: "⚠️",
                            }
                          );
                        }
                      }
                    }
                  }}
                  placeholder="e.g., 1000"
                  disabled={isExporting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollEnd">Roll Number End</Label>
                <Input
                  id="rollEnd"
                  type="number"
                  min="1"
                  max={
                    rollStart
                      ? (parseInt(rollStart) + 2499).toString()
                      : undefined
                  }
                  value={rollEnd}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    setError(null);

                    // Check if the new end value would exceed 2500 records
                    if (rollStart && newEnd) {
                      const start = parseInt(rollStart);
                      const end = parseInt(newEnd);
                      if (!isNaN(start) && !isNaN(end)) {
                        const range = end - start + 1;
                        if (range > 2500) {
                          const maxEnd = start + 2499;
                          setRollEnd(maxEnd.toString());
                          toast(
                            `Maximum 2500 records allowed. End roll number set to ${maxEnd}`,
                            {
                              icon: "⚠️",
                            }
                          );
                          return;
                        }
                      }
                    }

                    setRollEnd(newEnd);
                  }}
                  placeholder="e.g., 3200"
                  disabled={isExporting}
                />
              </div>
            </div>

            {/* Range Info */}
            {getRangeInfo() && (
              <div
                className={`text-sm p-2 rounded ${
                  getRangeInfo()?.isOverLimit
                    ? "text-red-800 bg-red-50 border border-red-200"
                    : "text-gray-600 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {getRangeInfo()?.isOverLimit && (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  {getRangeInfo()?.text}
                </div>
                {getRangeInfo()?.isOverLimit && (
                  <div className="text-xs mt-1 font-medium">
                    ⚠️ Exceeds maximum limit of 2500 records!
                  </div>
                )}
              </div>
            )}

            {/* Fee Details Checkbox */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeFeeDetails"
                  checked={includeFeeDetails}
                  onCheckedChange={(checked) =>
                    setIncludeFeeDetails(checked as boolean)
                  }
                  disabled={isExporting}
                />
                <Label
                  htmlFor="includeFeeDetails"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include fee details & installments (ZIP format)
                </Label>
              </div>
              {includeFeeDetails && (
                <div className="text-xs text-gray-600 ml-6">
                  📦 Will export a ZIP file containing student data +
                  installment details in separate Excel files
                </div>
              )}
              {!includeFeeDetails && (
                <div className="text-xs text-gray-600 ml-6">
                  📄 Will export a single Excel file with student data only
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={
                  isExporting ||
                  !rollStart ||
                  !rollEnd ||
                  getRangeInfo()?.isOverLimit ||
                  validateRange() !== null
                }
                className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Download className="h-4 w-4 mr-2 animate-pulse" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
