"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  FileText,
  Calendar,
  CreditCard,
  Package,
  BarChart3,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css";
import Image from "next/image";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: "students", label: "Students", icon: Users, accessTo: ["ADMIN", "FRONTDESK", "ACCOUNTS", "STORE"] },
  { id: "addStudent", label: "Add Student", icon: User, accessTo: ["ADMIN"] },
  { id: "teachers", label: "Teachers", icon: Users, accessTo: ["ADMIN"] },
  { id: "batches", label: "Batches", icon: BookOpen, accessTo: ["ADMIN", "FRONTDESK", "STORE"] },
  { id: "tests", label: "Test Reports", icon: FileText, accessTo: ["ADMIN", "FRONTDESK"] },
  { id: "attendance", label: "Attendance", icon: Calendar, accessTo: ["ADMIN", "FRONTDESK"] },
  { id: "fees", label: "Fee Management", icon: CreditCard, accessTo: ["ADMIN", "ACCOUNTS"] },
  { id: "kits", label: "Kit Management", icon: Package, accessTo: ["ADMIN", "STORE"] },
  { id: "marks", label: "Marks Comparison", icon: BarChart3, accessTo: ["ADMIN", "TEACHER"] },
  { id: "logout", label: "Logout", icon: LogOut },
];

export function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  // Use React's useState to store the user data
  const [userData, setUserData] = useState<any>({});
  
  // Use useEffect to fetch user data from localStorage when component mounts
  useEffect(() => {
    // Only run on the client side
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user_data");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
        } catch (error) {
          console.error("Failed to parse user data from localStorage:", error);
          setUserData({});
        }
      }
    }
  }, []);

  const handleItemClick = (itemId: string) => {
    if (itemId === "logout") {
      confirmAlert({
        title: "Confirm Logout",
        message: "Are you sure you want to logout?",
        buttons: [
          {
            label: "Yes",
            onClick: () => onLogout(),
          },
          {
            label: "No",
            onClick: () => {},
          },
        ],
      });
    } else {
      setActiveTab(itemId);
    }
  };
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-2 border-b border-gray-200">
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/logo/logo.svg"
            alt="Logo"
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-hidden">
        {/* The max-h-[calc(8*2.75rem)] limits height to show approximately 8 menu items */}
        <div className="space-y-2 overflow-y-auto max-h-[470px] pr-2 custom-scrollbar">
          {menuItems
            .filter(item => !item.accessTo || item.accessTo.includes(userData.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    activeTab === item.id &&
                      "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                  )}
                  onClick={() => handleItemClick(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
        </div>
      </nav>
    </div>
  );
}
