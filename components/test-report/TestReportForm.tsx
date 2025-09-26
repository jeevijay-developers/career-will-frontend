"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { addSingleTestReport } from "../../server/server";

interface Subject {
  name: string;
  marks: number;
}

interface TestReportFormData {
  rollNumber: string;
  student: string;
  father: string;
  batch: string;
  name: string;
  subjects: Subject[];
  percentile: string;
  total: string;
  rank: string;
  date: Date;
}

interface TestReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: TestReportFormData) => Promise<void>;
  batches?: Array<{ _id: string; name: string }>;
}

const COMMON_SUBJECTS = [
  "physics",
  "chemistry",
  "biology",
  "mathematics",
  "english",
  "general knowledge",
];

export function TestReportForm({
  isOpen,
  onClose,
  onSubmit,
  batches = [],
}: TestReportFormProps) {
  const [formData, setFormData] = useState<TestReportFormData>({
    rollNumber: "",
    student: "",
    father: "",
    batch: "",
    name: "",
    subjects: [
      { name: "physics", marks: 0 },
      { name: "chemistry", marks: 0 },
      { name: "biology", marks: 0 },
    ],
    percentile: "",
    total: "",
    rank: "",
    date: new Date(),
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof TestReportFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubjectChange = (
    index: number,
    field: keyof Subject,
    value: any
  ) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]:
        field === "marks" ? Number(value) || 0 : value.toLowerCase().trim(),
    };
    setFormData((prev) => ({
      ...prev,
      subjects: updatedSubjects,
    }));

    // Auto-calculate total when marks change
    if (field === "marks") {
      const total = updatedSubjects.reduce(
        (sum, subject) => sum + subject.marks,
        0
      );
      setFormData((prev) => ({
        ...prev,
        total: total.toString(),
      }));
    }
  };

  const addSubject = () => {
    setFormData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { name: "", marks: 0 }],
    }));
  };

  const removeSubject = (index: number) => {
    if (formData.subjects.length <= 1) {
      toast.error("At least one subject is required");
      return;
    }

    const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
    const total = updatedSubjects.reduce(
      (sum, subject) => sum + subject.marks,
      0
    );

    setFormData((prev) => ({
      ...prev,
      subjects: updatedSubjects,
      total: total.toString(),
    }));
  };

  const resetForm = () => {
    setFormData({
      rollNumber: "",
      student: "",
      father: "",
      batch: "",
      name: "",
      subjects: [
        { name: "physics", marks: 0 },
        { name: "chemistry", marks: 0 },
        { name: "biology", marks: 0 },
      ],
      percentile: "",
      total: "",
      rank: "",
      date: new Date(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.rollNumber.trim()) {
      toast.error("Roll number is required");
      return;
    }

    if (!formData.batch.trim()) {
      toast.error("Batch is required");
      return;
    }

    if (formData.subjects.length === 0) {
      toast.error("At least one subject is required");
      return;
    }

    // Check if all subjects have names
    const invalidSubject = formData.subjects.find(
      (subject) => !subject.name.trim()
    );
    if (invalidSubject) {
      toast.error("All subjects must have a name");
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform form data to match the API format
      const apiData = {
        rollNumber: parseInt(formData.rollNumber),
        student: formData.student.toLowerCase().trim(),
        father: formData.father.toLowerCase().trim(),
        batch: formData.batch.toLowerCase().trim(),
        subjects: formData.subjects
          .filter((subject) => subject.name.trim() !== "") // Only include subjects with names
          .map((subject) => ({
            name: subject.name.toLowerCase().trim(),
            marks: subject.marks,
          })),
        percentile: formData.percentile
          ? parseFloat(formData.percentile)
          : undefined,
        total: formData.total ? parseInt(formData.total) : undefined,
        rank: formData.rank ? parseInt(formData.rank) : undefined,
        date: formData.date.toISOString(),
        name: formData.name.toLowerCase().trim(),
      };

      console.log("Submitting test report:", apiData);

      // Call the API using the server function
      const response = await addSingleTestReport(apiData);
      console.log("Test report created successfully:", response.data);

      // Call the onSubmit callback if provided (for refreshing the list)
      if (onSubmit) {
        await onSubmit(formData);
      }

      resetForm();
      onClose();
      toast.success("Test report added successfully");
    } catch (error) {
      console.error("Error submitting test report:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add test report";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Test Report</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                type="number"
                value={formData.rollNumber}
                onChange={(e) =>
                  handleInputChange("rollNumber", e.target.value)
                }
                placeholder="Enter roll number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student">Student Name</Label>
              <Input
                id="student"
                value={formData.student}
                onChange={(e) => handleInputChange("student", e.target.value)}
                placeholder="Enter student name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="father">Father's Name</Label>
              <Input
                id="father"
                value={formData.father}
                onChange={(e) => handleInputChange("father", e.target.value)}
                placeholder="Enter father's name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Batch *</Label>
              {batches.length > 0 ? (
                <Select
                  value={formData.batch}
                  onValueChange={(value) => handleInputChange("batch", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem
                        key={batch._id}
                        value={batch.name.toLowerCase()}
                      >
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="batch"
                  value={formData.batch}
                  onChange={(e) => handleInputChange("batch", e.target.value)}
                  placeholder="Enter batch name"
                  required
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Test Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Mock Test 1, NEET Practice Test"
              />
            </div>

            <div className="space-y-2">
              <Label>Test Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date
                      ? format(formData.date, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange("date", date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Subjects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Subjects</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubject}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Subject
              </Button>
            </div>

            <div className="space-y-3">
              {formData.subjects.map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <Label className="text-sm">Subject Name</Label>
                    <Select
                      value={subject.name}
                      onValueChange={(value) =>
                        handleSubjectChange(index, "name", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_SUBJECTS.map((subjectName) => (
                          <SelectItem key={subjectName} value={subjectName}>
                            {subjectName.charAt(0).toUpperCase() +
                              subjectName.slice(1)}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom Subject</SelectItem>
                      </SelectContent>
                    </Select>
                    {subject.name === "custom" && (
                      <Input
                        className="mt-2"
                        placeholder="Enter custom subject name"
                        onChange={(e) =>
                          handleSubjectChange(index, "name", e.target.value)
                        }
                      />
                    )}
                  </div>

                  <div className="w-24">
                    <Label className="text-sm">Marks</Label>
                    <Input
                      type="number"
                      min="0"
                      value={subject.marks}
                      onChange={(e) =>
                        handleSubjectChange(index, "marks", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubject(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total">Total Marks</Label>
              <Input
                id="total"
                type="number"
                value={formData.total}
                onChange={(e) => handleInputChange("total", e.target.value)}
                placeholder="Auto-calculated"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentile">Percentile</Label>
              <Input
                id="percentile"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.percentile}
                onChange={(e) =>
                  handleInputChange("percentile", e.target.value)
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank">Rank</Label>
              <Input
                id="rank"
                type="number"
                min="1"
                value={formData.rank}
                onChange={(e) => handleInputChange("rank", e.target.value)}
                placeholder="Enter rank"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Adding...
                </>
              ) : (
                "Add Test Report"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
