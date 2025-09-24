"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreditCard, Upload } from "lucide-react";
import toast from "react-hot-toast";
import {
  FileUploadSection,
  UploadWarning,
  FeeUploadResult,
} from "./fee-upload";

interface BulkFeeUploadResponse {
  message: string;
  updatedCount: number;
  NOT_FOUND_ROLL_NUMBERS: number[];
}

type Props = {
  viewModal: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  onUploadSuccess?: () => void;
};

const BulkFeeUploadButton: React.FC<Props> = ({
  viewModal,
  setModal,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] =
    useState<BulkFeeUploadResponse | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (
        !allowedTypes.includes(file.type) &&
        !file.name.endsWith(".xls") &&
        !file.name.endsWith(".xlsx")
      ) {
        toast.error("Please select a valid Excel file (.xls, .xlsx)");
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("feeFile", selectedFile);

      const response = await fetch(
        "http://localhost:5000/api/bulk/upload-bulk-submissions",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result: BulkFeeUploadResponse = await response.json();
      setUploadResult(result);

      toast.success(
        `${result.message} - ${result.updatedCount} records updated`
      );

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      console.error("Fee upload error:", error);
      const errorMessage =
        error.message ||
        "Failed to upload fee installments. Please check the file format and try again.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setIsUploading(false);
  };

  const handleClose = () => {
    setModal(false);
    resetForm();
  };

  return (
    <Dialog open={viewModal} onOpenChange={setModal}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-transparent text-black border-purple-600"
          onClick={() => setModal(true)}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Fee Installment Upload
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bulk Fee Installment Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            <p className="mt-1">
              Upload Excel (.xls, .xlsx) file with fee installment records.
            </p>
          </div>

          <UploadWarning />

          <FileUploadSection
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onFileRemove={() => setSelectedFile(null)}
          />

          {uploadResult && <FeeUploadResult result={uploadResult} />}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Fee Data
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkFeeUploadButton;
