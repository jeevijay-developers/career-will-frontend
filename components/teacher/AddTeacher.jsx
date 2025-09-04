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
import { UserPlus, Check, AlertCircle, UserRoundPlus, LoaderCircle } from "lucide-react";
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
    const [formReset, setFormReset] = useState(false);
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
            // Prepare data for createUser (AuthController expects: username, email, password, role, phone)
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                phone: formData.phone,
            };
            console.log("User data:", userData);

            // Call createUser from server.js
            const response = await createUser(userData);
            if (response.error) {
                throw new Error(response.error);
            }
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

            // Add brief highlight effect to indicate form reset
            setFormReset(true);
            setTimeout(() => {
                setFormReset(false);
            }, 1000);

            // Scroll to top of form with animation
            window.scrollTo({ top: 0, behavior: 'smooth' });

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

    // Style classes - matching AddNewStudent form
    const commonInputClasses =
        "mt-1 text-start block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-200 ease-in-out p-2.5 bg-white hover:border-indigo-400 outline-none";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
    const requiredLabelClasses =
        "after:content-['*'] after:ml-0.5 after:text-red-500";
    const fieldsetClasses = 
        "p-5 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow duration-300";
    const sectionHeaderClasses = 
        "text-xl font-semibold mb-5 text-gray-800 border-b pb-2 flex items-center gap-2";

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center font-[Inter]">
            <style dangerouslySetInnerHTML={{
                __html: `
                  input, select, textarea {
                    border: 1px solid #d1d5db !important;
                  }
                  input:focus, select:focus, textarea:focus {
                    border-color: #6366f1 !important;
                    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2) !important;
                  }
                `
            }} />
            <div className="w-full max-w-4xl bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex items-center justify-center mb-6">
                    <div className="bg-indigo-50 p-2 rounded-xl">
                        <h1 className="text-3xl font-extrabold text-center text-indigo-700 px-4">
                            Add New Teacher
                        </h1>
                    </div>
                </div>

                {formError && (
                    <div className="flex items-center gap-3 p-4 mb-6 rounded-lg shadow-md border-l-4 animate-fadeIn bg-red-50 border-red-500">
                        <AlertCircle className="text-red-500 w-6 h-6" />
                        <p className="text-sm font-medium text-red-800">
                            {formError}
                        </p>
                    </div>
                )}

                <form 
                    onSubmit={handleSubmit} 
                    className={`space-y-6 ${formReset ? 'animate-pulse bg-green-50 transition-all duration-700' : ''}`}
                >
                    {/* Section: Teacher Information */}
                    <fieldset className={fieldsetClasses}>
                        <legend className={sectionHeaderClasses}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            Teacher Information
                        </legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                                <label
                                    htmlFor="username"
                                    className={`${labelClasses} ${requiredLabelClasses}`}
                                >
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={commonInputClasses}
                                    placeholder="Enter username"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                                <label
                                    htmlFor="email"
                                    className={`${labelClasses} ${requiredLabelClasses}`}
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="teacher@example.com"
                                        className={`${commonInputClasses} pl-10`}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                                <label
                                    htmlFor="password"
                                    className={`${labelClasses} ${requiredLabelClasses}`}
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a strong password"
                                        className={`${commonInputClasses} pl-10`}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                                <label
                                    htmlFor="phone"
                                    className={`${labelClasses} ${requiredLabelClasses}`}
                                >
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                        </svg>
                                    </div>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit phone number"
                                        className={`${commonInputClasses} pl-10`}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg md:col-span-2">
                                <label htmlFor="role" className={labelClasses}>
                                    Role
                                </label>
                                <input
                                    type="text"
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    className={`${commonInputClasses} bg-gray-100 cursor-not-allowed`}
                                    disabled
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Role is set to Teacher and cannot be changed.
                                </p>
                            </div>
                        </div>
                    </fieldset>

                    {/* Submit Button */}
                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            type="button"
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
                            className="px-8 py-3 text-lg font-semibold rounded-full border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition duration-300 ease-in-out transform disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative px-10 py-3.5 text-lg font-semibold rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center flex items-center justify-center"
                        >
                                {isSubmitting ? ( <LoaderCircle className="animate-spin h-5 w-5 text-white mr-2" /> ) : ( <UserRoundPlus className="h-4 w-4 text-white mr-2" /> )}
                            {isSubmitting ? "Adding Teacher..." : "Add Teacher"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}