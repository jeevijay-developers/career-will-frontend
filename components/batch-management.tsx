"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, SquarePen, Trash2 } from "lucide-react"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import toast from "react-hot-toast"
import { getAllBatches,createBatch, updateBatch, deleteBatch } from "@/server/server"

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
    // timing: "",
    // capacity: "",
    // instructor: "",
    class: "",
  });


  // Separate state for Create Batch form
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    class: "",
  })

  // Separate state for Edit Batch form
  const [editFormData, setEditFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    class: "",
  })

  const handleAddBatch = async () => {
    if (!validateForm()) return;
    
    try {
      const batchData = {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        class: formData.class,
      };
      
      const newBatch = await createBatch(batchData);
      console.log("Batch created:", newBatch);
      
      // Refresh the batches list
      await fetchBatches();
      
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        class: "",
      })
      setIsAddDialogOpen(false)
      setErrors({
        name: "",
        startDate: "",
        endDate: "",
        class: "",
      });

      toast.success(`Batch added successfully!`);
    } catch (error) {
      console.error("Failed to create batch:", error);
      toast.error("Failed to create batch");
    }
  }

  // Helper function to format date to DD/MM/YYYY
  const formatDateToDDMMYYYY = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to convert DD/MM/YYYY back to YYYY-MM-DD (for input fields)
  const convertDDMMYYYYToInputFormat = (dateString: string) => {
    if (!dateString) return "";
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return "";
  };

  const handleEditClick = (batch: Batch) => {
    setEditingBatch(batch);
    setEditFormData({
      name: batch.name,
      startDate: convertDDMMYYYYToInputFormat(batch.startDate),
      endDate: convertDDMMYYYYToInputFormat(batch.endDate), 
      class: batch.class || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateBatch = async () => {
    if (!editingBatch) return;

    try {
      const batchData = {
        name: editFormData.name,
        startDate: editFormData.startDate,
        endDate: editFormData.endDate,
        class: editFormData.class,
      };

      // Use the batch ID from the editing batch
      const batchId = editingBatch._id || editingBatch.id;
      
      await updateBatch(batchId, batchData);
      console.log("Batch updated successfully");
      
      // Refresh the batches list
      await fetchBatches();
      
      setEditFormData({
        name: "",
        startDate: "",
        endDate: "",
        class: "",
      });
      setEditingBatch(null);
      setIsEditDialogOpen(false);
      toast.success("Batch updated successfully!");
    } catch (error) {
      console.error("Failed to update batch:", error);
      toast.error("Failed to update batch");
    }
  };

  const handleDelete = (batch: Batch) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete the batch "${batch.name}"?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const batchId = batch._id || batch.id;
              await deleteBatch(batchId);
              console.log("Batch deleted successfully");
              
              // Refresh the batches list
              await fetchBatches();
              
              toast.success('Batch deleted successfully!');
            } catch (error) {
              console.error("Failed to delete batch:", error);
              toast.error("Failed to delete batch");
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Batch name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch batches from API
  const fetchBatches = async () => {
    try {
      const data = await getAllBatches();
            
      // If data is an array, use it directly; if it's an object with batches property, use that
      const batchesArray = Array.isArray(data) ? data : data.batches || [];
      
      // Map the data to match our Batch interface based on backend structure
      const mappedBatches = batchesArray.map((batch: any) => ({
        id: batch._id || batch.id,
        name: batch.name,
        startDate: formatDateToDDMMYYYY(batch.startDate),
        endDate: formatDateToDDMMYYYY(batch.endDate),
        timing: batch.timing || "09:00 AM to 04:00 PM",
        capacity: batch.capacity || 0,
        enrolled: batch.enrolled || 0,
        instructor: batch.instructor || "Not assigned",
        class: batch.class || "Not specified",
        duration: batch.duration || 0,
      }));
      
      setBatches(mappedBatches);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      toast.error("Failed to load batches");
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
          <DialogContent aria-describedby={undefined} className="max-w-lg">
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
                  placeholder="e.g., NEET-2024-C"
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
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="Enter class (e.g., 11, 12)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setFormData({ name: "", startDate: "", endDate: "", class: "" });
                setErrors({ name: "", startDate: "", endDate: "", class: "" });
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
                  <TableHead>Class</TableHead>
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
                      <TableCell className="font-medium">  {batch.name ? batch.name.charAt(0).toUpperCase() + batch.name.slice(1) : ""}</TableCell>
                      <TableCell>{batch.startDate}</TableCell>
                      <TableCell>{batch.endDate}</TableCell>
                      <TableCell>
                        {batch.class ? batch.class.charAt(0).toUpperCase() + batch.class.slice(1) : ""}
                      </TableCell>
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
                            onClick={() => handleDelete(batch)} 
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
        <DialogContent aria-describedby={undefined} className="max-w-lg">
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
                placeholder="e.g., NEET-2024-C"
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
              <Label htmlFor="edit-class">Class</Label>
              <Input
                id="edit-class"
                value={editFormData.class}
                onChange={(e) => setEditFormData({ ...editFormData, class: e.target.value })}
                placeholder="Enter class (e.g., 11, 12)"
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
