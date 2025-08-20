"use client";

import React, { useState } from "react";
import { AddTeacher } from "./AddTeacher";
import { toast } from "react-hot-toast";

export function TeacherManagement() {
  // Simple handler for when a teacher is added
  const handleAddTeacherComplete = () => {
    toast.success('Teacher added successfully');
  };

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
        <p className="text-gray-600">Add new teachers to the system</p>
      </div>
      
      <div className="max-w-3xl">
        <AddTeacher onComplete={handleAddTeacherComplete} />
      </div>
    </div>
  );
}
