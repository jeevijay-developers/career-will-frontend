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
      formData.append("studentFile", selectedFile);

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
        toast.error(`${response.errorCount} students failed to upload. Check the error details below.`);
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      // Attempt to provide more specific error information
      let errorMessage = "Failed to upload students. Please check the file format and try again.";
      let errorDetails: string[] = [];
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        if (Array.isArray(error.response.data.errors)) {
          errorDetails = error.response.data.errors;
        } else if (typeof error.response.data.error === 'string') {
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

          {/* File Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="file-upload" className="text-base font-medium">
              Select Excel File
            </Label>
            <p className="text-sm text-gray-600 mb-2">
              Upload a CSV or Excel file with student data. Required fields: name, rollNo, class, mobileNumber, emergencyContact, parent.parentContact, and phone.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {/* <Button variant="outline" onClick={handleDownloadTemplate} className="text-sm border-dashed">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Template
              </Button> */}
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
                      <p className="text-xs text-gray-600 mt-2 italic">
                        Make sure all required fields are properly filled: name, rollNo, class, mobileNumber, emergencyContact, parent.parentContact, and phone.
                      </p>
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