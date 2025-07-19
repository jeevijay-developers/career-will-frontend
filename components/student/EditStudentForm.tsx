"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { updateStudent, uploadStudentImage, findParentByEmail } from "../../server/server.js"
import Image from "next/image.js"

interface Kit {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

interface Student {
    id: string
    studentId: number
    name: string
    rollNo: string
    class: string
    kit: string[]
    parent: {
        id: string
        username: string
        name: string
        email: string
        phone: string
    }
    joinDate: string
    phone?: string
    address?: string
    image?: string
}

interface EditStudentFormProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    kits: Kit[];
    batches: any[];
    onStudentUpdated: () => void;
}

export function EditStudentForm({ isOpen, onClose, student, kits, batches, onStudentUpdated }: EditStudentFormProps) {
    const [selectedKits, setSelectedKits] = useState<Kit[]>([])
    const [selectedImage, setSelectedImage] = useState<string | { url: string } | null>(null);
    const [uploadedImage, setUploadedImage] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

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
        name: "",
        phone: "",
        address: "",
        batch: "",
        parentUsername: "",
        parentPassword: "",
        parentEmail: "",
        parentPhone: "",
    })

    // Populate form with existing student data
    useEffect(() => {
        if (student && isOpen) {
            setFormData({
                name: student.name || "",
                phone: student.phone || "",
                address: student.address || "",
                batch: student.class || (student as any).batch || "",
                parentUsername: student.parent?.username || "",
                parentPassword: "", // Don't populate password for security
                parentEmail: student.parent?.email || "",
                parentPhone: student.parent?.phone || "",
            });

            // Set selected kits based on student's current kits
            if (student.kit && Array.isArray(student.kit)) {
                const studentKits = kits.filter(kit => student.kit.includes(kit.name));
                setSelectedKits(studentKits);
            }

            // Set existing image if available
            if (student.image) {
                setSelectedImage(student.image);
                setUploadedImage(student.image);
            }
        }
    }, [student, isOpen, kits]);

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
        // Password is optional for edit (only validate if provided)
        if (formData.parentPassword.trim() && formData.parentPassword.length < 6) {
            newErrors.parentPassword = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdateStudent = async () => {
        if (!validateForm() || !student) return;

        setIsLoading(true);
        const kitIds = selectedKits.map(k => k._id);

        // Find the selected batch ObjectId
        const selectedBatch = batches.find(batch => batch.name === formData.batch);

        const updatedStudent = {
            id: (student as any)._id || student.id,
            name: formData.name,
            batch: selectedBatch?._id || selectedBatch?.id,
            phone: formData.phone,
            image: uploadedImage ? uploadedImage : undefined,
            parent: {
                username: formData.parentUsername,
                email: formData.parentEmail,
                phone: formData.parentPhone,
                ...(formData.parentPassword.trim() && { password: formData.parentPassword })
            },
            kit: kitIds,
            address: formData.address,
        }

        try {
            console.log("Updating student:", updatedStudent);
            await updateStudent(updatedStudent);

            resetForm();
            onClose();
            onStudentUpdated();
            toast.success("Student updated successfully!");
        } catch (error) {
            toast.error("Failed to update student. Please try again.");
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
                setFormData(prev => ({
                    ...prev,
                    parentUsername: response.username || "",
                    parentPhone: response.phone || "",
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

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    resetForm();
                    onClose();
                }
            }}
        >
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Student Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Student Information</h3>

                        {/* Profile Picture */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {selectedImage ? (
                                        <Image
                                            src={typeof selectedImage === 'string' ? selectedImage : (selectedImage?.url || "")}
                                            alt="Student Profile"
                                            width={96}
                                            height={96}
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
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            setSelectedImage(event.target?.result as string);
                                        };
                                        reader.readAsDataURL(file);

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
                                <Label htmlFor="parentPassword">Password (optional)</Label>
                                <div className="relative">
                                    <Input
                                        id="parentPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.parentPassword}
                                        onChange={(e) => setFormData({ ...formData, parentPassword: e.target.value })}
                                        placeholder="Leave blank to keep current password"
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
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateStudent}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isLoading}
                    >
                        {isLoading ? "Updating..." : "Update Student"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
