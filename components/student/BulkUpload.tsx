"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import toast from "react-hot-toast"
import { bulkUploadStudents } from "../../server/server.js"

type Props = {
    viewModal: boolean;
    setModal: React.Dispatch<React.SetStateAction<boolean>>;
    onUploadSuccess?: () => void;
}

const BulkUploadButton: React.FC<Props> = ({ viewModal, setModal, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    successCount?: number;
    errorCount?: number;
    errors?: string[];
  } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xls') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
        toast.error("Please select a valid Excel file (.xls, .xlsx) or CSV file");
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
      formData.append("file", selectedFile);

      const response = await bulkUploadStudents(formData);
      
      setUploadResult({
        success: true,
        message: response.message || "Students uploaded successfully",
        successCount: response.successCount,
        errorCount: response.errorCount,
        errors: response.errors
      });

      if (response.successCount > 0) {
        toast.success(`Successfully uploaded ${response.successCount} students`);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }

      if (response.errorCount > 0) {
        toast.error(`${response.errorCount} students failed to upload`);
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        message: error.response?.data?.message || "Failed to upload students. Please try again.",
        errors: error.response?.data?.errors || []
      });
      toast.error("Upload failed. Please check the file format and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a sample template CSV content
    const csvContent = `Name,Phone,Address,Batch,Parent Username,Parent Email,Parent Phone,Parent Password,Kit Names (comma separated)
John Doe,1234567890,123 Main St,Batch A,parent1,parent1@example.com,9876543210,password123,"Kit 1,Kit 2"
Jane Smith,0987654321,456 Oak Ave,Batch B,parent2,parent2@example.com,8765432109,password456,"Kit 1,Kit 3"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Template downloaded successfully");
  };

  const resetForm = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setIsUploading(false);
  };

  return (
    <Dialog open={viewModal} onOpenChange={setModal}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-green-600 hover:bg-green-700 text-white hover:text-white border-green-600"
          onClick={() => setModal(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Upload Students
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">

          {/* File Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="file-upload" className="text-base font-medium">
              Select Excel File
            </Label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded flex items-center hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {selectedFile ? "Change File" : "Choose File"}
              </label>
              <Input
                id="file-upload"
                type="file"
                accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upload Results */}
          {uploadResult && (
            <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertCircle className={`h-4 w-4 ${uploadResult.success ? "text-green-600" : "text-red-600"}`} />
              <AlertDescription>
                <div className="space-y-2">
                  <p className={uploadResult.success ? "text-green-800" : "text-red-800"}>
                    {uploadResult.message}
                  </p>
                  {uploadResult.successCount !== undefined && (
                    <p className="text-sm text-green-700">
                      ✓ Successfully uploaded: {uploadResult.successCount} students
                    </p>
                  )}
                  {uploadResult.errorCount !== undefined && uploadResult.errorCount > 0 && (
                    <p className="text-sm text-red-700">
                      ✗ Failed to upload: {uploadResult.errorCount} students
                    </p>
                  )}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-700">Errors:</p>
                      <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                        {uploadResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {uploadResult.errors.length > 5 && (
                          <li>... and {uploadResult.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setModal(false);
                resetForm();
              }}
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
                  Upload Students
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BulkUploadButton