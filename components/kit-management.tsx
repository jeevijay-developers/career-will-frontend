"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Package, CheckCircle, XCircle, Settings } from "lucide-react"
import { getAllKits, createKit } from "../server/server"
import toast from "react-hot-toast"

interface KitItem {
  id: string
  name: string
  description: string
  required: boolean
}

interface StudentKit {
  id: string
  studentName: string
  rollNumber: string
  items: {
    itemId: string
    received: boolean
    receivedDate?: string
  }[]
  completionPercentage: number
}


const mockStudentKits: StudentKit[] = [
  {
    id: "1",
    studentName: "Rahul Sharma",
    rollNumber: "JEE001",
    items: [
      { itemId: "1", received: true, receivedDate: "2024-01-15" },
      { itemId: "2", received: true, receivedDate: "2024-01-15" },
      { itemId: "3", received: false },
      { itemId: "4", received: true, receivedDate: "2024-01-16" },
      { itemId: "5", received: false },
      { itemId: "6", received: false },
    ],
    completionPercentage: 60,
  },
  {
    id: "2",
    studentName: "Priya Patel",
    rollNumber: "JEE002",
    items: [
      { itemId: "1", received: true, receivedDate: "2024-01-20" },
      { itemId: "2", received: true, receivedDate: "2024-01-20" },
      { itemId: "3", received: true, receivedDate: "2024-01-20" },
      { itemId: "4", received: true, receivedDate: "2024-01-20" },
      { itemId: "5", received: true, receivedDate: "2024-01-20" },
      { itemId: "6", received: false },
    ],
    completionPercentage: 100,
  },
]

export function KitManagement() {
  const [kitItems, setKitItems] = useState<KitItem[]>([])
  useEffect(() => {
    async function fetchKits() {
      try {
        const kits = await getAllKits();
        setKitItems(Array.isArray(kits) ? kits : []);
      } catch (err) {
        toast.error("Failed to fetch kits");
        setKitItems([]);
      }
    }
    fetchKits();
  }, []);
  const [studentKits, setStudentKits] = useState<StudentKit[]>(mockStudentKits)
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [isUpdateKitDialogOpen, setIsUpdateKitDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentKit | null>(null)
  const [newItemData, setNewItemData] = useState({
    name: "",
    description: "",
  })

  const handleAddKitItem = async () => {
    try {
      const createdKit = await createKit(newItemData);
      if (createdKit && (createdKit._id || createdKit.id)) {
        setKitItems([...kitItems, { ...createdKit, id: createdKit._id || createdKit.id }]);
        // Add this item to all existing student kits
        const newKitId = createdKit._id || createdKit.id;
        const updatedStudentKits = studentKits.map((studentKit) => ({
          ...studentKit,
          items: [...studentKit.items, { itemId: newKitId, received: false }],
        }));
        setStudentKits(updatedStudentKits);
        toast.success("Kit item added successfully");
      } else {
        toast.error("Failed to add kit item");
      }
    } catch (error) {
      toast.error("Error adding kit item");
    }
    setNewItemData({ name: "", description: "" });
    setIsAddItemDialogOpen(false);
  }

  const handleUpdateKitStatus = (studentId: string, itemId: string, received: boolean) => {
    const updatedKits = studentKits.map((kit) => {
      if (kit.id === studentId) {
        const updatedItems = kit.items.map((item) =>
          item.itemId === itemId
            ? { ...item, received, receivedDate: received ? new Date().toISOString().split("T")[0] : undefined }
            : item,
        )
        const requiredItems = kitItems.filter((item) => item.required)
        const receivedRequiredItems = updatedItems.filter((item) => {
          const kitItem = kitItems.find((ki) => ki.id === item.itemId)
          return kitItem?.required && item.received
        })
        const completionPercentage = Math.round((receivedRequiredItems.length / requiredItems.length) * 100)

        return {
          ...kit,
          items: updatedItems,
          completionPercentage,
        }
      }
      return kit
    })
    setStudentKits(updatedKits)
  }

  const getItemName = (itemId: string) => {
    return kitItems.find((item) => item.id === itemId)?.name || "Unknown Item"
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kit Management</h1>
          <p className="text-gray-600">Manage student kits and track item distribution</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Add Kit Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Kit Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newItemData.name}
                    onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                    placeholder="Enter item name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemDescription">Description</Label>
                  <Input
                    id="itemDescription"
                    value={newItemData.description}
                    onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                    placeholder="Enter item description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddKitItem} className="bg-blue-600 hover:bg-blue-700">
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Kit Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {kitItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.required && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Required</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Kit Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentKits.map((studentKit, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">{studentKit.studentName}</div>
                      <div className="text-sm text-gray-600">{studentKit.rollNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${getCompletionColor(studentKit.completionPercentage)}`}>
                        {studentKit.completionPercentage}%
                      </div>
                      <div className="text-sm text-gray-600">Complete</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${studentKit.completionPercentage}%` }}
                    ></div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(studentKit)
                      setIsUpdateKitDialogOpen(true)
                    }}
                  >
                    Update Status
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Kit Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  {kitItems.map((item, i) => (
                    <TableHead key={i} className="text-center">
                      {item.name}
                      {item.required && <span className="text-red-500">*</span>}
                    </TableHead>
                  ))}
                  <TableHead>Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentKits.map((studentKit, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{studentKit.rollNumber}</TableCell>
                    <TableCell>{studentKit.studentName}</TableCell>
                    {kitItems.map((item, i) => {
                      const studentItem = studentKit.items.find((si) => si.itemId === item.id)
                      return (
                        <TableCell key={i} className="text-center">
                          {studentItem?.received ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      <span className={`font-medium ${getCompletionColor(studentKit.completionPercentage)}`}>
                        {studentKit.completionPercentage}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isUpdateKitDialogOpen} onOpenChange={setIsUpdateKitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Kit Status</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedStudent.studentName}</p>
                <p className="text-sm text-gray-600">Roll: {selectedStudent.rollNumber}</p>
              </div>
              <div className="space-y-3">
                {selectedStudent.items.map((item, i) => {
                  const kitItem = kitItems.find((ki) => ki.id === item.itemId)
                  if (!kitItem) return null

                  return (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{kitItem.name}</div>
                        <div className="text-sm text-gray-600">{kitItem.description}</div>
                      </div>
                      <Checkbox
                        checked={item.received}
                        onCheckedChange={(checked) =>
                          handleUpdateKitStatus(selectedStudent.id, item.itemId, checked as boolean)
                        }
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsUpdateKitDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
