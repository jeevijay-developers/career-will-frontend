"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserPlus, Check, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

export function AddTeacher({ onComplete }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "TEACHER", // Default role is TEACHER
    phone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.username.trim()) return "Username is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password.trim()) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (!formData.phone.trim()) return "Phone number is required";
    if (!/^\d{10}$/.test(formData.phone.trim())) return "Phone number must be 10 digits";
    if (!formData.email.includes("@")) return "Please enter a valid email address";
    
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errorMessage = validateForm();
    if (errorMessage) {
      setFormError(errorMessage);
      toast.error(errorMessage);
      return;
    }
    
    setFormError("");
    setIsSubmitting(true);
    
    try {
      // Call your API to create teacher
      const response = await axios.post('/api/user/create-user', formData);
      
      console.log('Teacher added successfully:', response.data);
      toast.success('Teacher added successfully!');
      setIsSuccessDialogOpen(true);
      
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "TEACHER",
        phone: "",
      });
      
      // Call onComplete callback if provided
      if (typeof onComplete === 'function') {
        onComplete();
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      
      let errorMessage = 'Failed to add teacher';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setIsSuccessDialogOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-2xl">Add New Teacher</CardTitle>
          </div>
          <CardDescription>
            Enter the details to create a new teacher account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
                <p className="text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  name="phone"
                  placeholder="10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="FRONTDESK">Front Desk</SelectItem>
                    <SelectItem value="ACCOUNTS">Accounts</SelectItem>
                    <SelectItem value="STORE">Store</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Default role is Teacher. Only admins can change roles.
                </p>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              setFormData({
                username: "",
                email: "",
                password: "",
                role: "TEACHER",
                phone: "",
              });
              setFormError("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                Saving...
              </>
            ) : (
              "Add Teacher"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Success Dialog */}
      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-2">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <AlertDialogTitle>Teacher Added Successfully</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              The new teacher account has been created successfully. They can now log in using the provided credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseSuccessDialog}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
