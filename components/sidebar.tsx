"use client";

import {
  Users,
  BookOpen,
  FileText,
  Calendar,
  CreditCard,
  Package,
  BarChart3,
  GraduationCap,
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
  { id: "students", label: "Students", icon: Users },
  { id: "addStudent", label: "Add Student", icon: User },
  { id: "batches", label: "Batches", icon: BookOpen },
  { id: "tests", label: "Test Reports", icon: FileText },
  { id: "attendance", label: "Attendance", icon: Calendar },
  { id: "fees", label: "Fee Management", icon: CreditCard },
  { id: "kits", label: "Kit Management", icon: Package },
  { id: "marks", label: "Marks Comparison", icon: BarChart3 },
  { id: "logout", label: "Logout", icon: LogOut },
];

export function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
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
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
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

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
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
