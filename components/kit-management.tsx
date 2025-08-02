"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  CheckCircle,
  XCircle,
  Settings,
  Trash2,
  Plus,
} from "lucide-react";
import {
  getAllKits,
  createKit,
  deleteKit,
  getAllBatches,
  getStudentsWithIncompleteKit,
  updateStudentKit,
} from "../server/server";
import toast from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

interface KitItem {
  id: string;
  _id?: string; // Backend MongoDB I
  name: string;
  description: string;
  required: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Batch {
  id: string;
  _id?: string; // Backend ID
  name: string;
  startDate: string;
  endDate: string;
  timing: string;
  capacity: number;
  enrolled: number;
  instructor: string;
  class?: string; // Backend has class field
  duration?: number; // Backend has duration field
  createdAt?: string; // Backend timestamps
  updatedAt?: string;
  __v?: number; // MongoDB version field
}

interface StudentKit {
  id: string;
  studentName: string;
  rollNumber: string;
  batch: string; // batch name or id
  items: {
    itemId: string;
    received: boolean;
    receivedDate?: string;
  }[];
  completionPercentage: number;
}

// Helper function to map backend student data to StudentKit format
function mapBackendStudentToStudentKit(
  student: any,
  kitItems: KitItem[]
): StudentKit {
  const items = kitItems.map((kit) => {
    const receivedKit = (student.kit || []).find(
      (k: any) => (k._id || k) === kit._id || (k._id || k) === kit.id
    );
    return {
      itemId: kit.id,
      received: !!receivedKit,
      receivedDate:
        receivedKit && receivedKit.receivedDate
          ? receivedKit.receivedDate
          : undefined,
    };
  });
  const receivedCount = items.filter((i) => i.received).length;
  const completionPercentage =
    kitItems.length > 0
      ? Math.round((receivedCount / kitItems.length) * 100)
      : 0;
  return {
    id: student._id,
    studentName: student.name,
    rollNumber: student.rollNo ? String(student.rollNo) : "",
    batch: student.batch,
    items,
    completionPercentage,
  };
}

export function KitManagement() {
  const [kitItems, setKitItems] = useState<KitItem[]>([]);
  const [studentKits, setStudentKits] = useState<StudentKit[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isUpdateKitDialogOpen, setIsUpdateKitDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentKit | null>(
    null
  );
  const [newItemData, setNewItemData] = useState({
    name: "",
    description: "",
  });
  const [emptyBatchMessage, setEmptyBatchMessage] = useState<string>("");
  useEffect(() => {
    async function fetchKits() {
      try {
        const kits = await getAllKits();
        // console.log("Fetched kits:", kits);
        // Map the kits to ensure both _id and id are available for compatibility
        const mappedKits = Array.isArray(kits)
          ? kits.map((kit) => ({
              ...kit,
              id: kit._id || kit.id,
              required: kit.required || false, // Default to false if not specified
            }))
          : [];
        setKitItems(mappedKits);
      } catch (err) {
        console.error("Error fetching kits:", err);
        toast.error("Failed to fetch kits");
        setKitItems([]);
      }
    }
    fetchKits();
  }, []);

  useEffect(() => {
    async function fetchBatches() {
      try {
        const batchesData = await getAllBatches();
        const mappedBatches = Array.isArray(batchesData)
          ? batchesData.map((batch) => ({
              ...batch,
              id: batch._id || batch.id,
            }))
          : [];

        setBatches(mappedBatches);
      } catch (err) {
        console.error("Error fetching batches:", err);
        toast.error("Failed to fetch batches");
        setBatches([]);
      }
    }
    fetchBatches();
  }, []);

  //  console.log("batches",batches[0].id);

  // Fetch students with incomplete kits when batch is selected
  useEffect(() => {
    async function fetchStudentsForBatch() {
      if (kitItems.length === 0 || batches.length === 0) {
        setStudentKits([]);
        setEmptyBatchMessage("");
        return;
      }

      try {
        if (selectedBatch === "all") {
          // Fetch students from all batches
          const allStudents: any[] = [];

          for (const batch of batches) {
            if (batch._id) {
              try {
                const studentsWithIncompleteKit =
                  await getStudentsWithIncompleteKit(batch._id);
                if (
                  Array.isArray(studentsWithIncompleteKit) &&
                  studentsWithIncompleteKit.length > 0
                ) {
                  allStudents.push(...studentsWithIncompleteKit);
                }
              } catch (error) {
                // Don't log error for 404 - just means no students in this batch
                const errorMessage =
                  error instanceof Error ? error.message : String(error);
                if (
                  !errorMessage.includes("404") &&
                  !errorMessage.includes("No students found")
                ) {
                  console.error(
                    `Error fetching students for batch ${batch.name}:`,
                    error
                  );
                }
              }
            }
          }

          if (allStudents.length > 0) {
            // Map backend students to StudentKit format
            const dynamicStudentKits = allStudents.map((student: any) =>
              mapBackendStudentToStudentKit(student, kitItems)
            );
            setStudentKits(dynamicStudentKits);
            setEmptyBatchMessage("");
          } else {
            setStudentKits([]);
            setEmptyBatchMessage(
              "No students with incomplete kits found in any batch."
            );
          }
        } else {
          // Find the selected batch object to get its _id
          const batch = batches.find((b) => b.name === selectedBatch);
          if (!batch || !batch._id) {
            setStudentKits([]);
            setEmptyBatchMessage("");
            return;
          }

          const studentsWithIncompleteKit = await getStudentsWithIncompleteKit(
            batch._id
          );

          // Check if we have valid data
          if (
            Array.isArray(studentsWithIncompleteKit) &&
            studentsWithIncompleteKit.length > 0
          ) {
            // Map backend students to StudentKit format
            const dynamicStudentKits = studentsWithIncompleteKit.map(
              (student: any) => mapBackendStudentToStudentKit(student, kitItems)
            );
            setStudentKits(dynamicStudentKits);
            setEmptyBatchMessage("");
          } else {
            // No students found for this batch
            setStudentKits([]);
            setEmptyBatchMessage(
              `No students with incomplete kits found in "${selectedBatch}" batch.`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching students with incomplete kit:", error);
        setStudentKits([]);
        setEmptyBatchMessage("");
        // Don't show error toast for 404 - just means no students found
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          !errorMessage.includes("404") &&
          !errorMessage.includes("No students found")
        ) {
          toast.error("Failed to fetch students for selected batch");
        }
      }
    }

    fetchStudentsForBatch();
  }, [selectedBatch, batches, kitItems]);

  const handleAddKitItem = async () => {
    try {
      const createdKit = await createKit(newItemData);
      if (createdKit && (createdKit._id || createdKit.id)) {
        setKitItems([
          ...kitItems,
          { ...createdKit, id: createdKit._id || createdKit.id },
        ]);
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
  };

  const handleUpdateKitStatus = (
    studentId: string,
    itemId: string,
    received: boolean
  ) => {
    const updatedKits = studentKits.map((kit) => {
      if (kit.id === studentId) {
        const updatedItems = kit.items.map((item) =>
          item.itemId === itemId
            ? {
                ...item,
                received,
                receivedDate: received
                  ? new Date().toISOString().split("T")[0]
                  : undefined,
              }
            : item
        );
        const requiredItems = kitItems.filter((item) => item.required);
        const receivedRequiredItems = updatedItems.filter((item) => {
          const kitItem = kitItems.find((ki) => ki.id === item.itemId);
          return kitItem?.required && item.received;
        });
        const completionPercentage = Math.round(
          (receivedRequiredItems.length / requiredItems.length) * 100
        );

        const updatedKit = {
          ...kit,
          items: updatedItems,
          completionPercentage,
        };

        // Update selectedStudent if it's the same student
        if (selectedStudent && selectedStudent.id === studentId) {
          setSelectedStudent(updatedKit);
        }

        return updatedKit;
      }
      return kit;
    });
    setStudentKits(updatedKits);
  };

  const getItemName = (itemId: string) => {
    return kitItems.find((item) => item.id === itemId)?.name || "Unknown Item";
  };

  const getCompletionStats = (studentKit: StudentKit) => {
    const totalItems = kitItems.length;
    const receivedItems = studentKit.items.filter(
      (item) => item.received
    ).length;
    return { received: receivedItems, total: totalItems };
  };

  const getCompletionColor = (received: number, total: number) => {
    const percentage = total > 0 ? (received / total) * 100 : 0;
    if (percentage === 100) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getBatchName = (batchId: string) => {
    const batch = batches.find((b) => b._id === batchId || b.id === batchId);
    return batch ? batch.name : batchId; // Return batch name if found, otherwise return the ID
  };

  const filteredStudentKits = studentKits.filter((studentKit) => {
    if (selectedBatch === "all") return true;
    // Since we're already fetching students for the selected batch, show all
    return true;
  });

  const handleKitUpdate = async () => {
    if (!selectedStudent) return;
    const studentId = selectedStudent.id;
    // Only send received kit item ids
    const kitArray = selectedStudent.items
      .filter((item) => item.received)
      .map((item) => item.itemId);
    try {
      console.log("Updating kit for student:", studentId, "with items:", {
        kit: kitArray,
      });
      await updateStudentKit(studentId, { kit: kitArray });
      toast.success("Kit status updated successfully!");
      setIsUpdateKitDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update kit status");
    }
  };

  const handleDeleteKit = async (kitId: string) => {
    if (!kitId) {
      toast.error("Invalid kit ID");
      return;
    }

    confirmAlert({
      title: "Confirm Delete",
      message:
        "Are you sure you want to delete this kit? This action cannot be undone.",
      buttons: [
        {
          label: "Yes, Delete",
          onClick: async () => {
            try {
              console.log("Attempting to delete kit with ID:", kitId);
              const result = await deleteKit(kitId);
              console.log("Delete result:", result);

              // Remove the deleted kit from the kitItems state
              setKitItems((prevKits) =>
                prevKits.filter((kit) => kit.id !== kitId && kit._id !== kitId)
              );

              // Also remove this kit from all student kits
              setStudentKits((prevStudentKits) =>
                prevStudentKits.map((studentKit) => ({
                  ...studentKit,
                  items: studentKit.items.filter(
                    (item) => item.itemId !== kitId
                  ),
                }))
              );

              toast.success("Kit deleted successfully!");
            } catch (error) {
              console.error("Error deleting kit:", error);
              toast.error(`Failed to delete kit`);
            }
          },
        },
        {
          label: "Cancel",
          onClick: () => {
            console.log("Deletion cancelled");
          },
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kit Management</h1>
          <p className="text-gray-600">
            Manage student kits and track item distribution
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isAddItemDialogOpen}
            onOpenChange={setIsAddItemDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
              >
                <Plus />
                Add Kit Item
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Kit Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newItemData.name}
                    onChange={(e) =>
                      setNewItemData({ ...newItemData, name: e.target.value })
                    }
                    placeholder="Enter item name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemDescription">Description</Label>
                  <Input
                    id="itemDescription"
                    value={newItemData.description}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter item description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsAddItemDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddKitItem}
                  className="bg-blue-600 hover:bg-blue-700"
                >
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
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {kitItems.map((item) => (
                <div
                  key={item._id || item.id}
                  className="p-3 border rounded-lg"
                >
                  <div className="flex justify-between">
                    <div className="">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600 truncate w-full max-w-[200px] sm:max-w-[450px] ">
                        {item.description}
                      </div>
                    </div>
                    <button
                      className="relative gap-2 text-red-600 hover:underline p-3"
                      onClick={() => handleDeleteKit(item._id || item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.required && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        Required
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Kit Status</CardTitle>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.name}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {emptyBatchMessage ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">📋</div>
                  <p className="text-gray-600 font-medium">
                    {emptyBatchMessage}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    All students in this batch have complete kits!
                  </p>
                </div>
              ) : (
                filteredStudentKits.map((studentKit, i) => {
                  const { received, total } = getCompletionStats(studentKit);
                  return (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">
                            {studentKit.studentName}
                          </div>
                          <div className="text-sm text-gray-600">
                            Roll No: {studentKit.rollNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getBatchName(studentKit.batch)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-medium ${getCompletionColor(
                              received,
                              total
                            )}`}
                          >
                            {received}/{total}
                          </div>
                          <div className="text-sm text-gray-600">Items</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width:
                              total > 0 ? `${(received / total) * 100}%` : "0%",
                          }}
                        ></div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(studentKit);
                          setIsUpdateKitDialogOpen(true);
                        }}
                      >
                        Update Status
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <Card>
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
      </Card> */}

      <Dialog
        open={isUpdateKitDialogOpen}
        onOpenChange={setIsUpdateKitDialogOpen}
      >
        <DialogContent aria-describedby={undefined} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Kit Status</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedStudent.studentName}</p>
                <p className="text-sm text-gray-600">
                  Roll: {selectedStudent.rollNumber}
                </p>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {selectedStudent.items.map((item, i) => {
                  const kitItem = kitItems.find((ki) => ki.id === item.itemId);
                  if (!kitItem) return null;

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{kitItem.name}</div>
                        <div className="text-sm text-gray-600">
                          {kitItem.description}
                        </div>
                      </div>
                      <Checkbox
                        checked={item.received}
                        onCheckedChange={(checked) =>
                          handleUpdateKitStatus(
                            selectedStudent.id,
                            item.itemId,
                            checked as boolean
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsUpdateKitDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={handleKitUpdate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
