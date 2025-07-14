"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Users, Calendar, Clock } from "lucide-react"

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
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    timing: "",
    capacity: "",
    instructor: "",
  })

  const handleAddBatch = () => {
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
  }

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
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timing">Timing</Label>
                <Input
                  id="timing"
                  value={formData.timing}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  placeholder="e.g., 9:00 AM - 12:00 PM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="Maximum students"
                />
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
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
