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
import { Package, Upload } from "lucide-react";
import toast from "react-hot-toast";
import {
  FileUploadSection,
  UploadWarning,
  KitUploadResult,
} from "./kit-upload";

interface BulkKitUploadResponse {
  message: string;
  EXISTED_KITS: Array<{ id: string; name: string }>;
  NOT_FOUND_ROLL_NUMBERS: number[];
}

type Props = {
  viewModal: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  onUploadSuccess?: () => void;
};

const BulkKitUploadButton: React.FC<Props> = ({
  viewModal,
  setModal,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] =
    useState<BulkKitUploadResponse | null>(null);

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
      formData.append("kitFile", selectedFile);

      const response = await fetch(
        "http://localhost:5000/api/bulk/upload-bulk-kits",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result: BulkKitUploadResponse = await response.json();
      setUploadResult(result);

      toast.success(result.message);

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      console.error("Kit upload error:", error);
      const errorMessage =
        error.message ||
        "Failed to upload kits. Please check the file format and try again.";
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
          className="bg-transparent text-black border-green-600"
          onClick={() => setModal(true)}
        >
          <Package className="h-4 w-4 mr-2" />
          Kit Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bulk Upload Kits
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            <p className="mt-1">
              Upload Excel (.xls, .xlsx) file with kit distribution records.
            </p>
          </div>

          <UploadWarning />

          <FileUploadSection
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onFileRemove={() => setSelectedFile(null)}
          />

          {uploadResult && <KitUploadResult result={uploadResult} />}

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
              className="bg-green-600 hover:bg-green-700"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Kits
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkKitUploadButton;
