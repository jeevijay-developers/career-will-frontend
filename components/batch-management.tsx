"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Users, Calendar, Clock ,SquarePen,Trash2} from "lucide-react"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import toast from "react-hot-toast"

interface Batch {
  id: string
  name: string
  startDate: string
  endDate: string
  timing: string
  capacity: number
  enrolled: number
  instructor: string
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
  const [batches, setBatches] = useState<Batch[]>(mockBatches)
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <Card key={batch.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{batch.name}</span>
                <span className="text-sm font-normal text-gray-500">
                  {batch.enrolled}/{batch.capacity}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {batch.startDate} to {batch.endDate}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{batch.timing}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Instructor: {batch.instructor}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(batch.enrolled / batch.capacity) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Enrolled: {batch.enrolled}</span>
                <span className="text-gray-600">Available: {batch.capacity - batch.enrolled}</span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button  onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  <Trash2 /> Delete
                </Button>
                <Button onClick={() => handleEditClick(batch)} className="bg-blue-600 hover:bg-blue-700">
                  <SquarePen /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
