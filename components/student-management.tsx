"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import toast from "react-hot-toast"
import { getAllKits, createStudent, getAllBatches, uploadStudentImage, findParentByEmail, getAllStudents, getBatchById } from "../server/server.js"

interface Student {
  id: string
  studentId: number
  name: string
  rollNo: string
  class: string
  kit: string[] // kit names
  parent: Parent
  joinDate: string
}

interface Kit {
  _id: string; // MongoDB ObjectId as string
  name: string;
  description: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
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

export function StudentManagement() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5); // You can adjust page size as needed
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedKits, setSelectedKits] = useState<Kit[]>([])
  const [kits, setKits] = useState<Kit[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  // Validation errors state
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    address: "",
    batch: "",
    parentUsername: "",
    parentEmail: "",
    parentPhone: "",
    parentPassword: "",
  });

  const [formData, setFormData] = useState({
    // Student info
    name: "",
    phone: "",
    address: "",
    batch: "", // Will store batch ObjectId
    // Parent info
    parentUsername: "",
    parentPassword: "",
    parentEmail: "",
    parentPhone: "",
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<any>(null); // { public_id, url }
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [batchNames, setBatchNames] = useState<{[key: string]: string}>({}); // Cache for batch names

  useEffect(() => {
    async function fetchKitsAndBatches() {
      try {
        const kitsResponse = await getAllKits();
        setKits(kitsResponse);
        const batchesResponse = await getAllBatches();
        setBatches(batchesResponse);
      } catch (error) {
        setKits([]);
        setBatches([]);
        toast.error("Error fetching kits or batches");
      }
    }

    async function fetchStudents(page: number) {
      try {
        // Pass page and pageSize as query params
        let studentsResponse = await getAllStudents({ page, limit: pageSize });
        let studentsArr: any[] = [];
        let total = 1;
        if (Array.isArray(studentsResponse)) {
          studentsArr = studentsResponse;
        } else if (studentsResponse && Array.isArray(studentsResponse.students)) {
          studentsArr = studentsResponse.students;
          total = studentsResponse.totalPages || studentsResponse.total || 1;
        }
        // Sort ascending by rollNo or createdAt if available
        studentsArr.sort((a: any, b: any) => {
          if (a.rollNo && b.rollNo) {
            return String(a.rollNo).localeCompare(String(b.rollNo), undefined, { numeric: true });
          }
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          return 0;
        });
        setStudents(studentsArr);
        setTotalPages(total);
        // Fetch batch names for all students
        if (studentsArr && studentsArr.length > 0) {
          const batchIds = [...new Set(studentsArr.map((student: any) => student.batch).filter(Boolean))] as string[];
          const batchNamesMap: {[key: string]: string} = {};
          await Promise.all(
            batchIds.map(async (batchId: string) => {
              try {
                const batchResponse = await getBatchById(batchId);
                if (batchResponse && batchResponse.name) {
                  batchNamesMap[batchId] = batchResponse.name;
                }
              } catch (error) {
                console.error(`Error fetching batch ${batchId}:`, error);
                batchNamesMap[batchId] = "Unknown Batch";
              }
            })
          );
          setBatchNames(batchNamesMap);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
        toast.error("Error fetching students");
      }
    }

    fetchKitsAndBatches();
    fetchStudents(currentPage);
  }, [currentPage, pageSize]);

  // Sort students in ascending order by name before filtering
  const sortedStudents = [...students].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
  const filteredStudents = sortedStudents.filter(
    (student) =>
      (student.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (student.rollNo?.toString()?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
  );

  const handleKitToggle = (kit: Kit) => {
    setSelectedKits(prev =>
      prev.find(k => k._id === kit._id)
        ? prev.filter(k => k._id !== kit._id)
        : [...prev, kit]
    )
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      batch: "",
      parentUsername: "",
      parentPassword: "",
      parentEmail: "",
      parentPhone: "",
    })
    setSelectedKits([])
    setSelectedImage(null)
    setUploadedImage(null)
    setShowPassword(false)
    setIsCheckingEmail(false)
    setBatchNames({}) // Clear batch names cache
    setErrors({
      name: "",
      phone: "",
      address: "",
      batch: "",
      parentUsername: "",
      parentEmail: "",
      parentPhone: "",
      parentPassword: "",
    })
  }

  const validateForm = () => {
    const newErrors: any = {};

    // Student validation
    if (!formData.name.trim()) newErrors.name = "Student name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.batch.trim()) newErrors.batch = "Batch is required";

    // Parent validation
    if (!formData.parentUsername.trim()) newErrors.parentUsername = "Username is required";
    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.parentEmail)) {
      newErrors.parentEmail = "Email is invalid";
    }
    if (!formData.parentPhone.trim()) newErrors.parentPhone = "Parent phone number is required";
    if (!formData.parentPassword.trim()) newErrors.parentPassword = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStudent = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    const kitNames = selectedKits.map(k => k.name);
    
    // Find the selected batch ObjectId
    const selectedBatch = batches.find(batch => batch.name === formData.batch);
    
    const newStudent = {
      name: formData.name,
      batch: selectedBatch?._id || selectedBatch?.id, // Use ObjectId
      phone: formData.phone,
      image: uploadedImage ? uploadedImage : undefined,
      parent: {
        username: formData.parentUsername,
        password: formData.parentPassword,
        email: formData.parentEmail,
        phone: formData.parentPhone,
      },
      kit: kitNames,
      address: formData.address,
    }
    
    try {
      console.log("New student added:", newStudent);
      const response = await createStudent(newStudent);
      
      // Refresh the students list after adding a new student
      const updatedStudents = await getAllStudents({ page: currentPage, limit: pageSize });
      let studentsArr: any[] = [];
      if (Array.isArray(updatedStudents)) {
        studentsArr = updatedStudents;
      } else if (updatedStudents && Array.isArray(updatedStudents.students)) {
        studentsArr = updatedStudents.students;
      }
      setStudents(studentsArr);
      
      resetForm();
      setIsAddDialogOpen(false);
      toast.success("Student added successfully!");
    } catch (error) {
      toast.error("Error adding student:");
      toast.error("Failed to add student. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCheckParentEmail = async () => {
    if (!formData.parentEmail.trim()) {
      toast.error("Please enter an email address first");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.parentEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsCheckingEmail(true);
    try {
      const response = await findParentByEmail(formData.parentEmail);
      
      if (response && response.username) {
        // Auto-fill parent details (response contains parent info directly)
        setFormData(prev => ({
          ...prev,
          parentUsername: response.username || "",
          parentPhone: response.phone || "",
          // Note: We don't auto-fill password for security reasons
        }));
        toast.success("Parent found! Details auto-filled.");
      } else {
        toast.error("This email doesn't exist");
      }
    } catch (error) {
      toast.error("This email doesn't exist");
    } finally {
      setIsCheckingEmail(false);
    }
  };

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
  // const handleEditClick = (student: Student) => {
  //   // TODO: Implement edit functionality
  //   toast.info("Edit functionality coming soon!");
  // };
  
  // const handleUpdateStudent = () => {
  //   // TODO: Implement update functionality
  //   toast.info("Update functionality coming soon!");
  // };


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
                
                {/* Profile Picture - Centered at top */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {selectedImage ? (
                        <img 
                          src={selectedImage} 
                          alt="Student Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <Label 
                      htmlFor="studentImage" 
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Label>
                  </div>
                  <Input
                    id="studentImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Show preview
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setSelectedImage(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);

                        // Upload to server
                        const formData = new FormData();
                        formData.append("image", file);
                        try {
                          const res = await uploadStudentImage(formData);
                          if (res && res.image) {
                            setUploadedImage(res.image);
                            toast.success("Image uploaded successfully");
                          } else {
                            setUploadedImage(null);
                            toast.error("Image upload failed");
                          }
                        } catch (err) {
                          setUploadedImage(null);
                          toast.error("Image upload failed");
                        }
                      }
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-2">Profile Picture</p>
                </div>

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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch">Batch</Label>
                    <Select value={formData.batch} onValueChange={(value) => setFormData({ ...formData, batch: value })}>
                      <SelectTrigger className={errors.batch ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {(batches ?? []).map((batch) => (
                          <SelectItem key={batch._id || batch.id} value={batch.name}>{batch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.batch && <p className="text-red-500 text-sm">{errors.batch}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter address"
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                  </div>
                </div>
              </div>

              {/* Kit Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Student Kits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(kits ?? []).map((kit) => (
                    <div key={kit._id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`kit-${kit._id}`}
                        checked={selectedKits.some(k => k._id === kit._id)}
                        onCheckedChange={() => handleKitToggle(kit)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`kit-${kit._id}`}
                          className="text-sm font-medium capitalize cursor-pointer"
                          onClick={() => handleKitToggle(kit)}
                        >
                          {kit.name}
                        </Label>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="parentEmail">Email</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCheckParentEmail}
                        disabled={isCheckingEmail || !formData.parentEmail.trim()}
                        className="h-6 px-2 text-xs"
                      >
                        {isCheckingEmail ? "Checking..." : "Check mail"}
                      </Button>
                    </div>
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
                    <Label htmlFor="parentPhone">Parent Phone Number</Label>
                    <Input
                      id="parentPhone"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      placeholder="Enter parent phone number"
                      className={errors.parentPhone ? "border-red-500" : ""}
                    />
                    {errors.parentPhone && <p className="text-red-500 text-sm">{errors.parentPhone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="parentPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.parentPassword}
                        onChange={(e) => setFormData({ ...formData, parentPassword: e.target.value })}
                        placeholder="Enter password"
                        className={errors.parentPassword ? "border-red-500 pr-10" : "pr-10"}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.parentPassword && <p className="text-red-500 text-sm">{errors.parentPassword}</p>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => { setIsAddDialogOpen(false); resetForm(); }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddStudent} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Student"}
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
                  <TableHead>S No.</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Parent Email</TableHead>
                  <TableHead>Parent Phone</TableHead>
                  <TableHead>Kits</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, i) => (
                    <TableRow key={student.id || i}>
                      <TableCell className="font-medium">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                      <TableCell className="font-medium">{student.rollNo ?? "-"}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {typeof student.class === "string" && student.class
                            ? student.class
                            : (student as any).batch && batchNames[(student as any).batch]
                              ? batchNames[(student as any).batch]
                              : (student as any).batch || "-"}
                        </span>
                      </TableCell>
                      <TableCell>{student.parent?.name ?? student.parent?.username ?? "-"}</TableCell>
                      <TableCell>{student.parent?.email ?? "-"}</TableCell>
                      <TableCell>{student.parent?.phone ?? "-"}</TableCell>
                      <TableCell>
                        {/* Show x/y format for kits allotted */}
                        <span className=" text-sm text-gray-700">{student.kit?.length ?? 0} / {(kits ?? []).length}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            // onClick={() => handleEditClick(student)}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            <div className="flex justify-end items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TODO: Edit Student Dialog will be implemented later */}
    </div>
  )
}