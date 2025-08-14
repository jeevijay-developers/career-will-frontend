interface Student {
  id: string
  studentId: number
  name: string
  rollNo: string
  class: string
  kit: string[]
  parent: Parent
  batch: string
  joinDate: string
}

interface Kit {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
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

interface Batch {
  _id: string;
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type { Student, Kit, Parent, Batch };
