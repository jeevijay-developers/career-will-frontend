"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users, Calendar, Clock, SquarePen, Trash2 } from "lucide-react"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import toast from "react-hot-toast"
import { getAllBatches } from "@/server/server"

interface Batch {
  id: string
  _id?: string // Backend ID
  name: string
  startDate: string
  endDate: string
  timing: string
  capacity: number
  enrolled: number
  instructor: string
  class?: string // Backend has class field
  duration?: number // Backend has duration field
  createdAt?: string // Backend timestamps
  updatedAt?: string
  __v?: number // MongoDB version field
}

const mockBatches: Batch[] = [
  {
    id: "1",
    name: "JEE-2024-A",
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    timing: "9:00 AM - 12:00 PM",
    capacity: 30,
    enrolled: 25,
    instructor: "Dr. Rajesh Kumar",
  },
  {
    id: "2",
    name: "JEE-2024-B",
    startDate: "2024-02-01",
    endDate: "2024-12-31",
    timing: "2:00 PM - 5:00 PM",
    capacity: 25,
    enrolled: 20,
    instructor: "Prof. Sunita Sharma",
  },
]

export function BatchManagement() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)


  //validation errors
  const [errors, setErrors] = useState({
    name: "",
    startDate: "",
    endDate: "",
    timing: "",
    capacity: "",
    instructor: "",
  });


  // Separate state for Create Batch form
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    timing: "",
    capacity: "",
    instructor: "",
  })

  // Separate state for Edit Batch form
  const [editFormData, setEditFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    timing: "",
    capacity: "",
    instructor: "",
  })

  const handleAddBatch = () => {
    if (!validateForm()) return;
    const newBatch: Batch = {
      id: Date.now().toString(),
      ...formData,
      capacity: Number.parseInt(formData.capacity),
      enrolled: 0,
    }
    setBatches([...batches, newBatch])
    setFormData({
      name: "",
      startDate: "",
      endDate: "",
      timing: "",
      capacity: "",
      instructor: "",
    })
    setIsAddDialogOpen(false)
    setFormData({ name: "", startDate: "", endDate: "", timing: "", capacity: "", instructor: "" });
    setErrors({
      name: "",
      startDate: "",
      endDate: "",
      timing: "",
      capacity: "",
      instructor: "",
    });

    toast.success(`Batch added successfully!`);
  }

  const handleEditClick = (batch: Batch) => {
    setEditingBatch(batch);
    setEditFormData({
      name: batch.name,
      startDate: batch.startDate,
      endDate: batch.endDate,
      timing: batch.timing,
      capacity: batch.capacity.toString(),
      instructor: batch.instructor,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateBatch = () => {
    if (!editingBatch) return;


    const updatedBatch: Batch = {
      ...editingBatch,
      name: editFormData.name,
      startDate: editFormData.startDate,
      endDate: editFormData.endDate,
      timing: editFormData.timing,
      capacity: Number.parseInt(editFormData.capacity),
      instructor: editFormData.instructor,
    };

    setBatches(prev =>
      prev.map(b => (b.id === editingBatch.id ? updatedBatch : b))
    );

    setEditFormData({
      name: "",
      startDate: "",
      endDate: "",
      timing: "",
      capacity: "",
      instructor: "",
    });
    setEditingBatch(null);
    setIsEditDialogOpen(false);
    toast.success(`Batch updated successfully!`);
  };

  const handleDelete = () => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this Batch?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            // Call your delete function here
            alert('Item deleted!');
          }
        },
        {
          label: 'No',
          onClick: () => {
            // Optional: handle cancel
            console.log('Deletion cancelled');
          }
        }
      ]
    });
  };
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Batch name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.timing.trim()) newErrors.timing = "Timing is required";
    if (!formData.capacity || Number(formData.capacity) <= 0) newErrors.capacity = "Capacity must be greater than 0";
    // if (!formData.instructor.trim()) newErrors.instructor = "Instructor name is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // return true if no errors
  };

  // Fetch batches from API
  const fetchBatches = async () => {
    try {
      const data = await getAllBatches();
      console.log("Fetched batches:", data);
      
      // If data is an array, use it directly; if it's an object with batches property, use that
      const batchesArray = Array.isArray(data) ? data : data.batches || [];
      
      // Map the data to match our Batch interface based on backend structure
      const mappedBatches = batchesArray.map((batch: any) => ({
        id: batch._id || batch.id,
        name: batch.name,
        startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "",
        endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : "",
        timing: batch.timing || "09:00 AM to 04:00 PM", // Backend doesn't have timing field
        capacity: batch.capacity || 0,
        enrolled: batch.enrolled || 0,
        instructor: batch.instructor || "Not assigned", // Backend doesn't have instructor field
      }));
      
      setBatches(mappedBatches);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      toast.error("Failed to load batches");
      // Keep mock data as fallback
    }
  };

  // Fetch batches when component mounts
  useEffect(() => {
    fetchBatches();
  }, []);



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
          <p className="text-gray-600">Create and manage student batches</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batchName">Batch Name</Label>
                <Input
                  id="batchName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., JEE-2024-C"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timing">Timing</Label>
                <Input
                  id="timing"
                  value={formData.timing}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  placeholder="e.g., 9:00 AM - 12:00 PM"
                  className={errors.timing ? "border-red-500" : ""}
                />
                {errors.timing && <p className="text-red-500 text-sm">{errors.timing}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="Maximum students"
                  className={errors.capacity ? "border-red-500" : ""}
                />
                {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Instructor name"

                />

              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setFormData({ name: "", startDate: "", endDate: "", timing: "", capacity: "", instructor: "" });
                setErrors({ name: "", startDate: "", endDate: "", timing: "", capacity: "", instructor: "" });
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddBatch} className="bg-blue-600 hover:bg-blue-700">
                Create Batch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batches List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  {/* <TableHead>Duration (Days)</TableHead> */}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No batches found. Create your first batch!
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => (
                    <TableRow key={batch.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{batch.name}</TableCell>
                      <TableCell>{batch.startDate}</TableCell>
                      <TableCell>{batch.endDate}</TableCell>
                      {/* <TableCell>
                        {batch.duration ? `${batch.duration} days` : 'N/A'}
                      </TableCell> */}
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleEditClick(batch)} 
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <SquarePen className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            onClick={handleDelete} 
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Batch Dialog - Completely Separate from Create Batch */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-batchName">Batch Name</Label>
              <Input
                id="edit-batchName"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="e.g., JEE-2024-C"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-timing">Timing</Label>
              <Input
                id="edit-timing"
                value={editFormData.timing}
                onChange={(e) => setEditFormData({ ...editFormData, timing: e.target.value })}
                placeholder="e.g., 9:00 AM - 12:00 PM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={editFormData.capacity}
                onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })}
                placeholder="Maximum students"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-instructor">Instructor</Label>
              <Input
                id="edit-instructor"
                value={editFormData.instructor}
                onChange={(e) => setEditFormData({ ...editFormData, instructor: e.target.value })}
                placeholder="Instructor name"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingBatch(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBatch} className="bg-blue-600 hover:bg-blue-700">
              Update Batch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
