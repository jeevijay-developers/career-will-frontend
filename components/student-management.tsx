"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import toast from "react-hot-toast"


interface Student {
  id: string
  studentId: number
  name: string
  rollNo: string
  class: string
  kit: Kit[]
  parent: Parent
  joinDate: string
}

interface Kit {
  id: string
  name: string
  description: string
}

interface Parent {
  id: string
  username: string
  password: string
  role: "ADMIN" | "TEACHER" | "PARENT"
  name: string
  email: string
  phone: string
}

const mockKits: Kit[] = [
  { id: "1", name: "water bottle", description: "insulated water bottle for students" },
  { id: "2", name: "t-shirt", description: "school uniform t-shirt" },
  { id: "3", name: "bag", description: "school backpack for books and supplies" },
  { id: "4", name: "umbrella", description: "compact umbrella for rainy days" },
  { id: "5", name: "notebook", description: "spiral notebook for taking notes" },
]

const mockStudents: Student[] = [
  {
    id: "1",
    studentId: 1001,
    name: "Rahul Sharma",
    rollNo: "JEE001",
    class: "JEE-2024-A",
    kit: [mockKits[0], mockKits[1], mockKits[2]],
    parent: {
      id: "p1",
      username: "suresh_sharma",
      password: "password123",
      role: "PARENT",
      name: "Suresh Sharma",
      email: "suresh@example.com",
      phone: "9876543211",
    },
    joinDate: "2024-01-15",
  },
  {
    id: "2",
    studentId: 1002,
    name: "Priya Patel",
    rollNo: "JEE002",
    class: "JEE-2024-B",
    kit: [mockKits[0], mockKits[1], mockKits[3]],
    parent: {
      id: "p2",
      username: "amit_patel",
      password: "password123",
      role: "PARENT",
      name: "Amit Patel",
      email: "amit@example.com",
      phone: "9876543213",
    },
    joinDate: "2024-01-20",
  },
]

export function StudentManagement() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedKits, setSelectedKits] = useState<Kit[]>([])

  // Validation errors state
  const [errors, setErrors] = useState({
    name: "",
    rollNo: "",
    class: "",
    parentName: "",
    parentUsername: "",
    parentRole: "",
    parentEmail: "",
    parentPhone: "",
    parentPassword: "",
  });

  const [formData, setFormData] = useState({
    // Student info
    name: "",
    rollNo: "",
    class: "",
    // Parent info
    parentUsername: "",
    parentPassword: "",
    parentRole: "PARENT" as "ADMIN" | "TEACHER" | "PARENT",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  })

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleKitToggle = (kit: Kit) => {
    setSelectedKits(prev =>
      prev.find(k => k.id === kit.id)
        ? prev.filter(k => k.id !== kit.id)
        : [...prev, kit]
    )
  }

  const resetForm = () => {
    setFormData({
      name: "",
      rollNo: "",
      class: "",
      parentUsername: "",
      parentPassword: "",
      parentRole: "PARENT",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
    })
    setSelectedKits([])
    setErrors({
      name: "",
      rollNo: "",
      class: "",
      parentName: "",
      parentUsername: "",
      parentRole: "",
      parentEmail: "",
      parentPhone: "",
      parentPassword: "",
    })
  }

  const validateForm = () => {
    const newErrors: any = {};

    // Student validation
    if (!formData.name.trim()) newErrors.name = "Student name is required";
    if (!formData.rollNo.trim()) newErrors.rollNo = "Roll number is required";
    if (!formData.class.trim()) newErrors.class = "Class/Batch is required";

    // Parent validation
    if (!formData.parentName.trim()) newErrors.parentName = "Parent name is required";
    if (!formData.parentUsername.trim()) newErrors.parentUsername = "Username is required";
    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.parentEmail)) {
      newErrors.parentEmail = "Email is invalid";
    }
    if (!formData.parentPhone.trim()) newErrors.parentPhone = "Phone number is required";
    if (!formData.parentPassword.trim()) newErrors.parentPassword = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStudent = () => {
    if (!validateForm()) return;
    const newStudent: Student = {
      id: Date.now().toString(),
      studentId: Math.max(...students.map(s => s.studentId), 1000) + 1,
      name: formData.name,
      rollNo: formData.rollNo,
      class: formData.class,
      kit: selectedKits,
      parent: {
        id: `p${Date.now()}`,
        username: formData.parentUsername,
        password: formData.parentPassword,
        role: formData.parentRole,
        name: formData.parentName,
        email: formData.parentEmail,
        phone: formData.parentPhone,
      },
      joinDate: new Date().toISOString().split("T")[0],
    }
    setStudents([...students, newStudent])
    resetForm()
    setIsAddDialogOpen(false)
    toast.success(`Student added successfully!`);
  }

  const handleDelete = () => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this item?',
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
  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNo: student.rollNo,
      class: student.class,
      parentUsername: student.parent.username,
      parentPassword: student.parent.password,
      parentRole: student.parent.role,
      parentName: student.parent.name,
      parentEmail: student.parent.email,
      parentPhone: student.parent.phone,
    });
    setSelectedKits(student.kit);
    setIsEditDialogOpen(true);
  };
  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    const updatedStudent: Student = {
      ...editingStudent,
      name: formData.name,
      rollNo: formData.rollNo,
      class: formData.class,
      kit: selectedKits,
      parent: {
        ...editingStudent.parent,
        username: formData.parentUsername,
        password: formData.parentPassword,
        role: formData.parentRole,
        name: formData.parentName,
        email: formData.parentEmail,
        phone: formData.parentPhone,
      },
    };

    setStudents(prev =>
      prev.map(s => (s.id === editingStudent.id ? updatedStudent : s))
    );

    resetForm();
    setEditingStudent(null);
    setIsEditDialogOpen(false);
    toast.success(`Student updated successfully!`);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Manage JEE students and their information</p>
        </div>
        <Dialog 
          open={isAddDialogOpen} 
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (open) {
              setEditingStudent(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setEditingStudent(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Student Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Student Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter student name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rollNo">Roll Number</Label>
                    <Input
                      id="rollNo"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      placeholder="Enter roll number"
                      className={errors.rollNo ? "border-red-500" : ""}
                    />
                    {errors.rollNo && <p className="text-red-500 text-sm">{errors.rollNo}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="class">Class/Batch</Label>
                    <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                      <SelectTrigger className={errors.class ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select class/batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JEE-2024-A">JEE-2024-A</SelectItem>
                        <SelectItem value="JEE-2024-B">JEE-2024-B</SelectItem>
                        <SelectItem value="JEE-2024-C">JEE-2024-C</SelectItem>
                        <SelectItem value="JEE-2025-A">JEE-2025-A</SelectItem>
                        <SelectItem value="JEE-2025-B">JEE-2025-B</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.class && <p className="text-red-500 text-sm">{errors.class}</p>}
                  </div>
                </div>
              </div>

              {/* Kit Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Student Kits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {mockKits.map((kit) => (
                    <div key={kit.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`kit-${kit.id}`}
                        checked={selectedKits.some(k => k.id === kit.id)}
                        onCheckedChange={() => handleKitToggle(kit)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`kit-${kit.id}`}
                          className="text-sm font-medium capitalize cursor-pointer"
                        >
                          {kit.name}
                        </Label>
                        <p className="text-xs text-gray-500 capitalize">{kit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Parent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent Name</Label>
                    <Input
                      id="parentName"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="Enter parent name"
                      className={errors.parentName ? "border-red-500" : ""}
                    />
                    {errors.parentName && <p className="text-red-500 text-sm">{errors.parentName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentUsername">Username</Label>
                    <Input
                      id="parentUsername"
                      value={formData.parentUsername}
                      onChange={(e) => setFormData({ ...formData, parentUsername: e.target.value })}
                      placeholder="Enter username"
                      className={errors.parentUsername ? "border-red-500" : ""}
                    />
                    {errors.parentUsername && <p className="text-red-500 text-sm">{errors.parentUsername}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Email</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      placeholder="Enter email"
                      className={errors.parentEmail ? "border-red-500" : ""}
                    />
                    {errors.parentEmail && <p className="text-red-500 text-sm">{errors.parentEmail}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Phone Number</Label>
                    <Input
                      id="parentPhone"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      placeholder="Enter phone number"
                      className={errors.parentPhone ? "border-red-500" : ""}
                    />
                    {errors.parentPhone && <p className="text-red-500 text-sm">{errors.parentPhone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPassword">Password</Label>
                    <Input
                      id="parentPassword"
                      type="password"
                      value={formData.parentPassword}
                      onChange={(e) => setFormData({ ...formData, parentPassword: e.target.value })}
                      placeholder="Enter password"
                      className={errors.parentPassword ? "border-red-500" : ""}
                    />
                    {errors.parentPassword && <p className="text-red-500 text-sm">{errors.parentPassword}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentRole">Role</Label>
                    <Select value={formData.parentRole} onValueChange={(value: "ADMIN" | "TEACHER" | "PARENT") => setFormData({ ...formData, parentRole: value })}>
                      <SelectTrigger className={errors.parentRole ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PARENT">Parent</SelectItem>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.parentRole && <p className="text-red-500 text-sm">{errors.parentRole}</p>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleAddStudent} className="bg-blue-600 hover:bg-blue-700">
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Students List</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Parent Email</TableHead>
                  <TableHead>Parent Phone</TableHead>
                  <TableHead>Kits</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.rollNo}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{student.class}</span>
                    </TableCell>
                    <TableCell>{student.parent.name}</TableCell>
                    <TableCell>{student.parent.email}</TableCell>
                    <TableCell>{student.parent.phone}</TableCell>
                    <TableCell>
                      {/* Show x/y format for kits allotted */}
                      <span className=" text-sm text-gray-700">{student.kit.length} / {mockKits.length}</span>
                    </TableCell>
                    <TableCell>{student.joinDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(student)} // ← Add this line
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={handleDelete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Student Dialog - Separate from Add Student */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Student Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Student Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter student name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-rollNo">Roll Number</Label>
                  <Input
                    id="edit-rollNo"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="Enter roll number"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-class">Class/Batch</Label>
                  <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class/batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JEE-2024-A">JEE-2024-A</SelectItem>
                      <SelectItem value="JEE-2024-B">JEE-2024-B</SelectItem>
                      <SelectItem value="JEE-2024-C">JEE-2024-C</SelectItem>
                      <SelectItem value="JEE-2025-A">JEE-2025-A</SelectItem>
                      <SelectItem value="JEE-2025-B">JEE-2025-B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Kit Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Student Kits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mockKits.map((kit) => (
                  <div key={kit.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`edit-kit-${kit.id}`}
                      checked={selectedKits.some(k => k.id === kit.id)}
                      onCheckedChange={() => handleKitToggle(kit)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`edit-kit-${kit.id}`}
                        className="text-sm font-medium capitalize cursor-pointer"
                      >
                        {kit.name}
                      </Label>
                      <p className="text-xs text-gray-500 capitalize">{kit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parent Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Parent Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-parentName">Parent Name</Label>
                  <Input
                    id="edit-parentName"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Enter parent name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-parentUsername">Username</Label>
                  <Input
                    id="edit-parentUsername"
                    value={formData.parentUsername}
                    onChange={(e) => setFormData({ ...formData, parentUsername: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-parentEmail">Email</Label>
                  <Input
                    id="edit-parentEmail"
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-parentPhone">Phone Number</Label>
                  <Input
                    id="edit-parentPhone"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-parentPassword">Password</Label>
                  <Input
                    id="edit-parentPassword"
                    type="password"
                    value={formData.parentPassword}
                    onChange={(e) => setFormData({ ...formData, parentPassword: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-parentRole">Role</Label>
                  <Select value={formData.parentRole} onValueChange={(value: "ADMIN" | "TEACHER" | "PARENT") => setFormData({ ...formData, parentRole: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PARENT">Parent</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); setEditingStudent(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStudent} className="bg-blue-600 hover:bg-blue-700">
              Update Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
