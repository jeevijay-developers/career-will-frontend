"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { Users, Plus, Mail, Phone, Edit, Trash2, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddTeacher } from "./AddTeacher";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Badge } from "@/components/ui/badge";

// Define types
interface Teacher {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'TEACHER' | 'FRONTDESK' | 'ACCOUNTS' | 'STORE';
  createdAt?: string;
  updatedAt?: string;
}

export function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/user/get-all-users');
      // Filter users by role (if the API doesn't already do this)
      const filteredUsers = response.data.filter((user: any) => 
        ['TEACHER', 'ADMIN', 'FRONTDESK', 'ACCOUNTS', 'STORE'].includes(user.role)
      );
      setTeachers(filteredUsers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const searchLower = searchTerm.toLowerCase();
    return (
      teacher.username.toLowerCase().includes(searchLower) ||
      teacher.email.toLowerCase().includes(searchLower) ||
      teacher.role.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'TEACHER':
        return 'bg-blue-100 text-blue-800';
      case 'FRONTDESK':
        return 'bg-green-100 text-green-800';
      case 'ACCOUNTS':
        return 'bg-yellow-100 text-yellow-800';
      case 'STORE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/user/delete-user/${id}`);
        toast.success('User deleted successfully');
        fetchTeachers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleAddTeacherComplete = () => {
    setIsAddDialogOpen(false);
    fetchTeachers(); // Refresh the list after adding new teacher
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage teachers and staff members</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <AddTeacher onComplete={handleAddTeacherComplete} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Members
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          </div>
          <CardDescription>
            {filteredTeachers.length} staff member{filteredTeachers.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mr-2"></div>
                        Loading staff members...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No staff members match your search' : 'No staff members found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher, index) => (
                    <TableRow key={teacher._id || index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{teacher.username}</TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {teacher.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {teacher.phone || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(teacher.role)}>
                          {teacher.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            onClick={() => handleDelete(teacher._id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
