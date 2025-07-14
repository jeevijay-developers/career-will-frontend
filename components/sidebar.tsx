"use client"

import { Users, BookOpen, FileText, Calendar, CreditCard, Package, BarChart3, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const menuItems = [
  { id: "students", label: "Students", icon: Users },
  { id: "batches", label: "Batches", icon: BookOpen },
  { id: "tests", label: "Test Reports", icon: FileText },
  { id: "attendance", label: "Attendance", icon: Calendar },
  { id: "fees", label: "Fee Management", icon: CreditCard },
  { id: "kits", label: "Kit Management", icon: Package },
  { id: "marks", label: "Marks Comparison", icon: BarChart3 },
]

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">JEE Admin</h1>
            <p className="text-sm text-gray-500">Student Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  activeTab === item.id && "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
