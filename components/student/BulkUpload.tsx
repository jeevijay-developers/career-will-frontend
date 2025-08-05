"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
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

  // Helper function to check if any error string contains roll number exists error
  const hasRollNumberError = (errors: string[] | undefined): boolean => {
    if (!errors) return false;
    return errors.some(error => 
      error.toLowerCase().includes("roll number already exists") || 
      error.toLowerCase().includes("duplicate roll") ||
      error.toLowerCase().includes("rollno") && error.toLowerCase().includes("exists")
    );
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
      formData.append("studentFile", selectedFile);

      const response = await bulkUploadStudents(formData);
      
      // Check if there are roll number errors specifically
      const hasRollNumberDuplicateError = hasRollNumberError(response.errors);
      
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
      
      // If there are roll number errors, show a specific toast
      if (hasRollNumberDuplicateError) {
        toast.error("Duplicate roll numbers found. Please ensure all roll numbers are unique.", 
          { duration: 5000, id: "duplicate-roll-error" });
      }

      // Display error information in toast with more details
      if (response.errorCount > 0) {
        // Show a summary toast
        toast.error(`${response.errorCount} students failed to upload`);
        
        // Show more detailed errors if available (up to 3)
        if (response.errors && response.errors.length > 0) {
          const errorsToShow = response.errors.slice(0, 3);
          errorsToShow.forEach((error: string) => {
            setTimeout(() => {
              // Check for specific error messages
              if (error.includes("Roll number already exists")) {
                toast.error("Roll number already exists. Please use unique roll numbers.", { duration: 5000 });
              } else {
                toast.error(error);
              }
            }, 300); // Small delay between toasts for readability
          });
          
          // If there are more errors, show a count
          if (response.errors.length > 3) {
            setTimeout(() => {
              toast.error(`...and ${response.errors.length - 3} more errors. See details in the dialog.`);
            }, 1200);
          }
        }
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      // Extract error message from our improved server response
      let errorMessage = "Failed to upload students. Please check the file format and try again.";
      let errorDetails: string[] = [];
      
      // Check if this is our formatted error from server.js
      if (error && error.message) {
        errorMessage = error.message;
        
        // Handle specific roll number error message
        if (error.message.includes("Roll number already exists")) {
          toast.error("Duplicate roll numbers found. Please ensure all roll numbers are unique.", 
            { duration: 5000, id: "duplicate-roll-error" });
        } else {
          toast.error(errorMessage, { duration: 5000 });
        }
        
        errorDetails = [error.message];
      }
      // Fallback for other error formats (backward compatibility)
      else if (error.response?.data) {
        // Handle specific error cases
        const isRollNumberError = error.response.data.error === "Roll number already exists." ||
                               (typeof error.message === 'string' && error.message.includes("Roll number already exists"));
        
        if (isRollNumberError || 
           (typeof error.response.data.error === 'string' && 
            error.response.data.error.toLowerCase().includes("roll") && 
            error.response.data.error.toLowerCase().includes("exists"))) {
          errorMessage = "Roll number already exists. Please use unique roll numbers.";
          toast.error(errorMessage, { duration: 5000, id: "duplicate-roll-error" });
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
          toast.error(errorMessage);
        }
        
        if (Array.isArray(error.response.data.errors)) {
          errorDetails = error.response.data.errors;
          
          // Check if any error is about duplicate roll numbers
          if (hasRollNumberError(errorDetails)) {
            toast.error("Duplicate roll numbers found. Please ensure all roll numbers are unique.", 
              { duration: 5000, id: "duplicate-roll-error" });
          } else {
            // Show up to 3 specific error messages in toasts
            errorDetails.slice(0, 3).forEach((errorDetail: string, index: number) => {
              setTimeout(() => {
                toast.error(errorDetail);
              }, 300 * (index + 1)); // Stagger toasts
            });
          }
        } else if (typeof error.response?.data?.error === 'string') {
          errorDetails = [error.response.data.error];
        }
      }
      setUploadResult({
        success: false,
        message: errorMessage,
        errors: errorDetails
      });
      
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

  const handleDownloadTemplate = () => {
    // Create a sample template CSV content with updated schema fields
    const csvContent = `name,rollNo,class,previousSchoolName,medium,DOB,gender,category,state,city,pinCode,permanentAddress,mobileNumber,tShirtSize,howDidYouHearAboutUs,programmeName,emergencyContact,email,parent.occupation,parent.fatherName,parent.motherName,parent.parentContact,parent.email,batch,phone,kit
John Doe,12345,11th,ABC School,English,2000-01-01,MALE,GENERAL,Maharashtra,Mumbai,400001,123 Main St,9876543210,M,Online,JEE Program,9876543210,john@example.com,Doctor,Mr. Doe,Mrs. Doe,9988776655,parent@example.com,Batch A,9876543210,"Kit1,Kit2"
Jane Smith,12346,12th,XYZ School,English,2001-02-02,FEMALE,OBC,Delhi,New Delhi,110001,456 Oak Ave,8765432109,L,Friend,NEET Program,8765432109,jane@example.com,Engineer,Mr. Smith,Mrs. Smith,8877665544,parent2@example.com,Batch B,8765432109,"Kit1,Kit3"`;
    
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

  return (
    <Dialog open={viewModal} onOpenChange={setModal}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-transparent text-black border-blue-600"
          onClick={() => setModal(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Upload Students
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            <p className="mt-1">
              Upload Excel (.xls, .xlsx) or CSV file with student records.
            </p>
            <p className="mt-2">
              File should contain columns for: name, rollNo, class, mobileNumber, emergencyContact, parent.parentContact, and phone. All fields marked as required must be filled.
            </p>
          </div>

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
            <Alert
              className={
                uploadResult.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              <AlertCircle
                className={`h-4 w-4 ${
                  uploadResult.success ? "text-green-600" : "text-red-600"
                }`}
              />
              <AlertDescription>
                <div className="space-y-2">
                  <p
                    className={
                      uploadResult.success
                        ? "text-green-800 font-medium"
                        : "text-red-800 font-medium"
                    }
                  >
                    {uploadResult.message}
                  </p>
                  {uploadResult.success &&
                    uploadResult.successCount &&
                    uploadResult.successCount > 0 && (
                      <p className="text-sm text-gray-600">
                        The students have been successfully processed and
                        added to the database.
                      </p>
                    )}
                  {uploadResult.successCount !== undefined && (
                    <p className="text-sm text-green-700">
                      ✓ Successfully uploaded: {uploadResult.successCount}{" "}
                      students
                    </p>
                  )}
                  {uploadResult.errorCount !== undefined &&
                    uploadResult.errorCount > 0 && (
                      <p className="text-sm text-red-700">
                        ✗ Failed to upload: {uploadResult.errorCount} students
                      </p>
                    )}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-700">
                        Errors:
                      </p>
                      <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                        {uploadResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {uploadResult.errors.length > 5 && (
                          <li>
                            ... and {uploadResult.errors.length - 5} more errors
                          </li>
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
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-blue-600 hover:bg-blue-700"
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