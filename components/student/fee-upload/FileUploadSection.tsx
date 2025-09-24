"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle, X } from "lucide-react";

interface FileUploadSectionProps {
  selectedFile: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  selectedFile,
  onFileSelect,
  onFileRemove,
}) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="fee-file-upload" className="text-base font-medium">
        Select Excel File
      </Label>
      <div className="flex items-center gap-4">
        <label
          htmlFor="fee-file-upload"
          className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded flex items-center hover:bg-purple-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          {selectedFile ? "Change File" : "Choose File"}
        </label>
        <Input
          id="fee-file-upload"
          type="file"
          accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={onFileSelect}
          className="hidden"
        />
        {selectedFile && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <span>{selectedFile.name}</span>
            <button
              type="button"
              onClick={onFileRemove}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
