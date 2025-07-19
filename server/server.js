import apiClient from "./config";

// Kits api
export const getAllKits = async () => {
  try {
    const response = await apiClient.get("/api/kit/get-all-kits");    
    return response.data;
  } catch (error) {
    console.error("Error fetching kits:", error);
    throw new Error("Error fetching kits");
  }
} 

export const createKit = async (kitData) => {
  try {
    const response = await apiClient.post("/api/kit/create-kit", kitData);
    return response.data;
  } catch (error) {
    console.error("Error creating kit:", error);
    throw new Error("Error creating kit");
  }
}

// User authentication APIs
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error("Error logging in");
  }
} 

// Student APIs
export const createStudent = async (studentData) => {
  try {
    const response = await apiClient.post("/api/student/create-student", studentData);
    return response.data;
  } catch (error) {
    console.error("Error creating student:", error);
    throw new Error("Error creating student");
  }
}

 export const uploadStudentImage = async (formData) => {
  try {
    console.log("Image data:", formData);
    const response = await apiClient.post("/api/student/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading student image:", error);
    throw new Error("Error uploading student image");
  }
}

export const getAllStudents = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    const url = `/api/student/get-all-students${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log("Fetching students with URL:", url);
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw new Error("Error fetching students");
  }
}

export const findParentByEmail = async (email) => {
  try {
    const response = await apiClient.get(`/api/student/find-parent-by-email/${email}`);
    return response.data;
  } catch (error) {
    console.error("Error finding parent by email:", error);
    throw new Error("Error finding parent by email");
  }
}

export const updateStudent = async (studentData) => {
  try {
    const response = await apiClient.put(`/api/student/update-student/${studentData.id}`, studentData);
    return response.data;
  } catch (error) {
    console.error("Error updating student:", error);
    throw new Error("Error updating student");
  }
}

// Bulk upload APIs
export const bulkUploadStudents = async (formData) => {
  try {
    const response = await apiClient.post("/api/student/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading students file:", error);
    throw new Error("Error uploading students file");
  }
}

export async function bulkUploadTestReports(formData) {
  // TODO: Implement API call to backend for bulk uploading test reports
  // Example:
  // return fetch('/api/test-reports/bulk-upload', { method: 'POST', body: formData })
  //   .then(res => res.json());
  return { message: 'Stub: Implement backend', successCount: 0, errorCount: 0, errors: [] };
}

export const bulkUploadAttendance = async (formData) => {
  try {
    const response = await apiClient.post("/api/attendance/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading attendance file:", error);
    throw new Error("Error uploading attendance file");
  }
}

// Batch APIs
export const getAllBatches = async () => {
  try {
    const response = await apiClient.get("/api/batch/get-all-batches");
    return response.data;
  } catch (error) {
    console.error("Error fetching batches:", error);
    throw new Error("Error fetching batches");
  }
};

export const createBatch = async (batchData) => {
  try {
    const response = await apiClient.post("/api/batch/create-batch", batchData);
    return response.data;
  } catch (error) {
    console.error("Error creating batch:", error);
    throw new Error("Error creating batch");
  }
};

export const getBatchById = async (batchId) => {
  try {
    const response = await apiClient.get(`/api/batch/get-batch-by-id/${batchId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error("Error fetching batch by ID:", error);
    throw new Error("Error fetching batch by ID");
  }
}

export const updateBatch = async (batchId, batchData) => {
  try {
    const response = await apiClient.put(`/api/batch/update-batch-by-id/${batchId}`, batchData);
    return response.data;
  } catch (error) {
    console.error("Error updating batch:", error);
    throw new Error("Error updating batch");
  }
}

export const deleteBatch = async (batchId) => {
  try {
    const response = await apiClient.delete(`/api/batch/delete-batch-by-id/${batchId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting batch:", error);
    throw new Error("Error deleting batch");
  }
}