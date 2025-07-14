"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { StudentManagement } from "@/components/student-management"
import { BatchManagement } from "@/components/batch-management"
import { TestReports } from "@/components/test-reports"
import { AttendanceReports } from "@/components/attendance-reports"
import { FeeManagement } from "@/components/fee-management"
import { KitManagement } from "@/components/kit-management"
import { MarksComparison } from "@/components/marks-comparison"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("students")

  const renderContent = () => {
    switch (activeTab) {
      case "students":
        return <StudentManagement />
      case "batches":
        return <BatchManagement />
      case "tests":
        return <TestReports />
      case "attendance":
        return <AttendanceReports />
      case "fees":
        return <FeeManagement />
      case "kits":
        return <KitManagement />
      case "marks":
        return <MarksComparison />
      default:
        return <StudentManagement />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  )
}
