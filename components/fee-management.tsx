"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, CreditCard, AlertCircle, CheckCircle } from "lucide-react"
import { createFeeSubmission, getAllFees, updateFeeOfStudent } from "../server/server"
import toast from "react-hot-toast"

interface FeeRecord {
  _id: string
  studentRollNo: number
  studentName: string
  amount: number
  paidAmount: number
  dueDate: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export function FeeManagement() {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
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

  // Fetch all fee records on component mount
  useEffect(() => {
    const fetchFeeRecords = async () => {
      try {
        const response = await getAllFees()
        console.log("Fetched fee records:", response)
        setFeeRecords(response)
      } catch (error) {
        console.error("Error fetching fee records:", error)
        toast.error("Failed to fetch fee records")
      }
    }

    fetchFeeRecords()
  }, [])

  const handleAddFeeRecord = async () => {
    try {
      const feeData = {
        studentRollNo: parseInt(formData.rollNumber),
        amount: parseInt(formData.totalFee),
        paidAmount: parseInt(formData.installmentAmount) || 0,
        dueDate: formData.dueDate,
      };

      console.log("Creating fee submission with data:", feeData);
      const response = await createFeeSubmission(feeData);
      
      // Refresh the data from server
      const updatedRecords = await getAllFees();
      setFeeRecords(updatedRecords);
      
      setFormData({
        studentName: "",
        rollNumber: "",
        totalFee: "",
        installmentAmount: "",
        dueDate: "",
      });
      setIsAddDialogOpen(false);
      toast.success("Fee record created successfully!");
    } catch (error) {
      console.error("Error creating fee record:", error);
      toast.error("Failed to create fee record. Please try again.");
    }
  }

  const handlePayment = async () => {
    if (!selectedStudent) return

    try {
      const paymentAmount = Number.parseInt(paymentData.amount)
      const remainingAmount = selectedStudent.amount - selectedStudent.paidAmount
      
      // Validation
      if (!paymentAmount || paymentAmount <= 0) {
        toast.error("Please enter a valid payment amount");
        return;
      }
      
      if (paymentAmount > remainingAmount) {
        toast.error("Payment amount cannot exceed remaining amount");
        return;
      }
      
      // Call the updateFeeOfStudent API
      const updateData = {
        paidAmount: paymentAmount,
        date: paymentData.paymentDate || new Date().toISOString().split('T')[0]
      };
      
      console.log("Updating fee with data:", updateData);
      await updateFeeOfStudent(selectedStudent._id, updateData);
      
      // Refresh the data from server
      const updatedRecords = await getAllFees();
      setFeeRecords(updatedRecords);
      
      setPaymentData({ amount: "", paymentDate: "" })
      setIsPaymentDialogOpen(false)
      setSelectedStudent(null)
      toast.success("Payment recorded successfully!");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment. Please try again.");
    }
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
          <DialogContent aria-describedby={undefined}  className="max-w-lg">
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
                {feeRecords.map((record) => {
                  const remainingAmount = record.amount - record.paidAmount;
                  const status = remainingAmount === 0 ? "paid" : (record.paidAmount > 0 ? "partial" : "pending");
                  
                  return (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{record.studentRollNo}</TableCell>
                      <TableCell>{record.studentName}</TableCell>
                      <TableCell>₹{record.amount.toLocaleString()}</TableCell>
                      <TableCell>₹{record.paidAmount.toLocaleString()}</TableCell>
                      <TableCell>₹{remainingAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className={getStatusBadge(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {status !== "paid" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(record)
                              setPaymentData({ 
                                amount: "", 
                                paymentDate: new Date().toISOString().split('T')[0] 
                              })
                              setIsPaymentDialogOpen(true)
                            }}
                          >
                            Add Payment
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedStudent.studentName}</p>
                <p className="text-sm text-gray-600">Roll: {selectedStudent.studentRollNo}</p>
                <p className="text-sm text-gray-600">Remaining: ₹{(selectedStudent.amount - selectedStudent.paidAmount).toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  placeholder="Enter amount"
                  max={selectedStudent.amount - selectedStudent.paidAmount}
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
