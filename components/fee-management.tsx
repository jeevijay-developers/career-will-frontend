"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, CreditCard, AlertCircle, CheckCircle } from "lucide-react"

interface FeeRecord {
  id: string
  studentName: string
  rollNumber: string
  totalFee: number
  paidAmount: number
  remainingAmount: number
  installments: Installment[]
  status: "paid" | "partial" | "pending"
}

interface Installment {
  id: string
  amount: number
  dueDate: string
  paidDate?: string
  status: "paid" | "pending" | "overdue"
}

const mockFeeRecords: FeeRecord[] = [
  {
    id: "1",
    studentName: "Rahul Sharma",
    rollNumber: "JEE001",
    totalFee: 50000,
    paidAmount: 30000,
    remainingAmount: 20000,
    status: "partial",
    installments: [
      { id: "1", amount: 15000, dueDate: "2024-01-15", paidDate: "2024-01-10", status: "paid" },
      { id: "2", amount: 15000, dueDate: "2024-02-15", paidDate: "2024-02-12", status: "paid" },
      { id: "3", amount: 20000, dueDate: "2024-03-15", status: "pending" },
    ],
  },
  {
    id: "2",
    studentName: "Priya Patel",
    rollNumber: "JEE002",
    totalFee: 50000,
    paidAmount: 50000,
    remainingAmount: 0,
    status: "paid",
    installments: [{ id: "1", amount: 50000, dueDate: "2024-01-15", paidDate: "2024-01-10", status: "paid" }],
  },
]

export function FeeManagement() {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>(mockFeeRecords)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<FeeRecord | null>(null)
  const [formData, setFormData] = useState({
    studentName: "",
    rollNumber: "",
    totalFee: "",
    installmentAmount: "",
    dueDate: "",
  })
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentDate: "",
  })

  const handleAddFeeRecord = () => {
    const newRecord: FeeRecord = {
      id: Date.now().toString(),
      studentName: formData.studentName,
      rollNumber: formData.rollNumber,
      totalFee: Number.parseInt(formData.totalFee),
      paidAmount: 0,
      remainingAmount: Number.parseInt(formData.totalFee),
      status: "pending",
      installments: [
        {
          id: Date.now().toString(),
          amount: Number.parseInt(formData.installmentAmount),
          dueDate: formData.dueDate,
          status: "pending",
        },
      ],
    }
    setFeeRecords([...feeRecords, newRecord])
    setFormData({
      studentName: "",
      rollNumber: "",
      totalFee: "",
      installmentAmount: "",
      dueDate: "",
    })
    setIsAddDialogOpen(false)
  }

  const handlePayment = () => {
    if (!selectedStudent) return

    const paymentAmount = Number.parseInt(paymentData.amount)
    const updatedRecords = feeRecords.map((record) => {
      if (record.id === selectedStudent.id) {
        const newPaidAmount = record.paidAmount + paymentAmount
        const newRemainingAmount = record.totalFee - newPaidAmount
        return {
          ...record,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newRemainingAmount === 0 ? ("paid" as const) : ("partial" as const),
        }
      }
      return record
    })

    setFeeRecords(updatedRecords)
    setPaymentData({ amount: "", paymentDate: "" })
    setIsPaymentDialogOpen(false)
    setSelectedStudent(null)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-sm font-medium"
    switch (status) {
      case "paid":
        return `${baseClasses} bg-green-100 text-green-800`
      case "partial":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case "pending":
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return baseClasses
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "partial":
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600">Track student fees and payment installments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Fee Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="Student name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="Roll number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalFee">Total Fee Amount</Label>
                <Input
                  id="totalFee"
                  type="number"
                  value={formData.totalFee}
                  onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
                  placeholder="Total fee amount"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installmentAmount">First Installment</Label>
                  <Input
                    id="installmentAmount"
                    type="number"
                    value={formData.installmentAmount}
                    onChange={(e) => setFormData({ ...formData, installmentAmount: e.target.value })}
                    placeholder="Amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFeeRecord} className="bg-blue-600 hover:bg-blue-700">
                Add Record
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fee Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Total Fee</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.rollNumber}</TableCell>
                    <TableCell>{record.studentName}</TableCell>
                    <TableCell>₹{record.totalFee.toLocaleString()}</TableCell>
                    <TableCell>₹{record.paidAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{record.remainingAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className={getStatusBadge(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.status !== "paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(record)
                            setIsPaymentDialogOpen(true)
                          }}
                        >
                          Add Payment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedStudent.studentName}</p>
                <p className="text-sm text-gray-600">Roll: {selectedStudent.rollNumber}</p>
                <p className="text-sm text-gray-600">Remaining: ₹{selectedStudent.remainingAmount.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  placeholder="Enter amount"
                  max={selectedStudent.remainingAmount}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment} className="bg-blue-600 hover:bg-blue-700">
              Add Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
