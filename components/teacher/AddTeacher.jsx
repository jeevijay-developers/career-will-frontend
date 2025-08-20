"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserPlus, Check, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { createUser } from "@/server/server";

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
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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
            // Prepare data for createUser (AuthController expects: name, email, password, role, phone)
            const userData = {
                name: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                phone: formData.phone,
            };
            // Call createUser from server.js
            const response = await createUser(userData);

            toast.success('Teacher added successfully!');
            // Removed setIsSuccessDialogOpen(true); to prevent double notification

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

    return (
        <div className="max-w-3xl mx-auto">
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
                            <div className="flex gap-5">
                                <div className="grid gap-3 w-full">
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
                                <div className="grid gap-3 w-full">
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
                            </div>

                            <div className="flex gap-5">
                                <div className="grid gap-3 w-full">
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
                                </div>

                                <div className="grid gap-3 w-full">
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
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="role">Role</Label>
                                <Input
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    disabled
                                    className="w-full"
                                />
                                <p className="text-xs text-gray-500">
                                    Role is set to Teacher and cannot be changed.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-5 justify-end mt-5">
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
                                type="submit"
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
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}