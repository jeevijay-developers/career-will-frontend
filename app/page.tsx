"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Login } from "@/components/Login";
import { StudentManagement } from "@/components/student/student-management";
import { BatchManagement } from "@/components/batch-management";
import { TestReports } from "@/components/test-report/test-reports";
import { AttendanceReports } from "@/components/attendence/attendance-reports";
import { FeeManagement } from "@/components/fee-management";
import { KitManagement } from "@/components/kit-management";
import { MarksComparison } from "@/components/marks-comparison";
import toast from "react-hot-toast";
import AddNewStudent from "@/components/student/AddNewStudent";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("students");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on page load
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setIsAuthenticated(false);
    setActiveTab("students"); // Reset to default tab
    toast.success("Logged out successfully");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "students":
        return <StudentManagement />;
      case "addStudent":
        return <AddNewStudent />;
      case "batches":
        return <BatchManagement />;
      case "tests":
        return <TestReports />;
      case "attendance":
        return <AttendanceReports />;
      case "fees":
        return <FeeManagement />;
      case "kits":
        return <KitManagement />;
      case "marks":
        return <MarksComparison />;
      default:
        return <StudentManagement />;
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show admin panel if authenticated
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}
