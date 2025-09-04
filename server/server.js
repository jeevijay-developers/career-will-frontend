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
};

export const createKit = async (kitData) => {
  try {
    const response = await apiClient.post("/api/kit/create-kit", kitData);
    return response.data;
  } catch (error) {
    console.error("Error creating kit:", error);
    throw new Error("Error creating kit");
  }
};

export const deleteKit = async (kitId) => {
  try {
    // Standard REST pattern - DELETE /api/kit/:id
    const response = await apiClient.delete(
      `/api/kit/delete-kit-by-id/${kitId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting kit:", error);
    console.error("Attempted URL:", `/api/kit/delete-kit-by-id/${kitId}`);
    throw new Error("Error deleting kit");
  }
};

// User authentication APIs
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error("Error logging in");
  }
};

// Student APIs
export const createStudent = async (studentData) => {
  try {
    const response = await apiClient.post(
      "/api/student/create-student",
      studentData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};

export const uploadStudentImage = async (formData) => {
  try {
    console.log("Image data:", formData);
    const response = await apiClient.post(
      "/api/student/upload-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading student image:", error);
    throw new Error("Error uploading student image");
  }
};

export const getAllStudents = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    const url = `/api/student/get-all-students${queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
  }
};

export const findParentByEmail = async (email) => {
  try {
    const response = await apiClient.get(
      `/api/student/find-parent-by-email/${email}`
    );
    return response.data;
  } catch (error) {
    console.error("Error finding parent by email:", error);
    throw new Error("Error finding parent by email");
  }
};

export const updateStudent = async (studentData) => {
  try {
    const response = await apiClient.put(
      `/api/student/update-student/${studentData.id}`,
      studentData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating student:", error);
    throw new Error("Error updating student");
  }
};

export const getStudentsWithIncompleteKit = async (batchId) => {
  try {
    const response = await apiClient.get(
      `/api/student/incomplete-kit/${batchId}`
    );
    if (response.status === 200) return response.data;
    else throw new Error("Failed to fetch students with incomplete kit");
  } catch (error) {
    console.error("Error fetching students with incomplete kit:", error);
    throw new Error("Error fetching students with incomplete kit");
  }
};

export const updateStudentKit = async (studentId, kitItems) => {
  try {
    const response = await apiClient.put(
      `/api/student/update-student-kit/${studentId}`,
      kitItems
    );
    return response.data;
  } catch (error) {
    console.error("Error updating student kit:", error);
    throw new Error("Error updating student kit");
  }
};

export const updateStudentBatch = async (studentId, newBatchId) => {
  try {
    const response = await apiClient.put(
      `/api/student/update-student-batch`,
      {
        studentId: studentId,
        newBatchId: newBatchId
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating student batch:", error);
    throw new Error("Error updating student batch");
  }
}

export const searchStudent = async (searchTerm) => {
  try {
    const response = await apiClient.get(
      `/api/student/search-students?query=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching student:", error);
    throw new Error("Error searching student");
  }
};

export const searchTestScore = async (searchTerm) => {
  try {
    const response = await apiClient.get(
      `/api/test-score/search-test-scores?query=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching test scores:", error);
    throw new Error("Error searching test scores");
  }
};

export const deleteStudentByRollNumber = async (rollNumber) => {
  try {
    const response = await apiClient.delete(
      `/api/student/delete-student/${rollNumber}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting student by roll number:", error);
    throw new Error("Error deleting student by roll number");
  }
};

// Bulk upload APIs
export const bulkUploadStudents = async (formData) => {
  try {
    const response = await apiClient.post(
      "/api/bulk/upload-bulk-students",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading students file:", error);
    // Extract error message from response if available
    if (error.response && error.response.data) {
      if (error.response.data.error === "Roll number already exists.") {
        throw new Error(
          "Roll number already exists. Please use unique roll numbers."
        );
      } else if (error.response.data.error) {
        throw new Error(error.response.data.error);
      } else if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error(
      "Error uploading students. Please check your file and try again."
    );
  }
};

export async function bulkUploadTestReports(formData) {
  try {
    const response = await apiClient.post(
      "/api/bulk/upload-test-scores",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading test reports file:", error);
    throw new Error("Error uploading test reports file");
  }
}

export const getAllTestScores = async (page, limit) => {
  try {
    const response = await apiClient.get(`/api/test-score/get-all-test-scores?page=${page}&limit=${limit}`);
    console.log("Fetched test scores:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching test scores:", error);
    throw new Error("Error fetching test scores");
  }
};

export const bulkUploadAttendance = async (formData) => {
  try {
    const response = await apiClient.post(
      "/api/bulk/upload-bulk-attendence",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading attendance file:", error);
    throw new Error("Error uploading attendance file");
  }
};

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

// export const getBatchById = async (batchId) => {
//   try {
//     const response = await apiClient.get(
//       `/api/batch/get-batch-by-id/${batchId}`
//     );
//     return response.data;
//   } catch (error) {
//     if (error.response && error.response.status === 404) {
//       return null;
//     }
//     console.error("Error fetching batch by ID:", error);
//     throw new Error("Error fetching batch by ID");
//   }
// };

export const updateBatch = async (batchId, batchData) => {
  try {
    const response = await apiClient.put(
      `/api/batch/update-batch-by-id/${batchId}`,
      batchData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating batch:", error);
    throw new Error("Error updating batch");
  }
};

export const deleteBatch = async (batchId) => {
  try {
    const response = await apiClient.delete(
      `/api/batch/delete-batch-by-id/${batchId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting batch:", error);
    throw new Error("Error deleting batch");
  }
};

// Fee APIs
export const createFeeSubmission = async (feeData) => {
  try {
    const response = await apiClient.post(
      "/api/fee/create-fee-submission",
      feeData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating fee submission:", error);
    throw new Error("Error creating fee submission");
  }
};

export const getAllFees = async () => {
  try {
    const response = await apiClient.get("/api/fee/get-all-fees");
    return response.data;
  } catch (error) {
    console.error("Error fetching fees:", error);
    throw new Error("Error fetching fees");
  }
};

export const updateFeeOfStudent = async (feeId, feeData) => {
  try {
    const response = await apiClient.put(
      `/api/fee/update-fee/${feeId}`,
      feeData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating fee of student:", error);
    throw new Error("Error updating fee of student");
  }
};

export const checkRollNumberExists = async (rollNo) => {
  try {
    const response = await apiClient.get(
      `/api/student/check-roll-number/${rollNo}`
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error("Error fetching fee by ID:", error);
    throw new Error("Error fetching fee by ID");
  }
};

export const getFeeByRollNumber = async (rollNo) => {
  try {
    const response = await apiClient.get(
      `/api/fee/get-fee-by-roll-number/${rollNo}`
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error("Error fetching fee by roll number:", error);
    throw new Error("Error fetching fee by roll number");
  }
}

// Attendance APIs
export const getAttendanceByDate = async (date) => {
  try {
    const response = await apiClient.get(`/api/student/get-attendence-by-date?date=${date}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance by date:", error);
    throw new Error("Error fetching attendance by date");
  }
}


// Marks comparison
export const getMarksComparisonByRollNumber = async (rollNumber) => {
  try {
    const response = await apiClient.get(`api/test-score/get-all-attended-tests/${rollNumber}`);
    return response?.data;
  } catch (error) {
    // If it's a 404, throw the specific error message from the server
    if (error.response && error.response.status === 404) {
      const errorMessage = error.response.data?.message || "No scores found for this roll number";
      throw error; // Re-throw the error so the component can access the response
    }
    console.error("Error fetching marks comparison by roll number:", error);
    throw error; // Re-throw other errors as well
  }
};

// Super Admin Dashboard APIs
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get("/api/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Error fetching dashboard stats");
  }
};

export const getBatchWiseStats = async () => {
  try {
    const response = await apiClient.get("/api/dashboard/batch-wise-stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching batch wise stats:", error);
    throw new Error("Error fetching batch wise stats");
  }
};

export const getAttendanceStats = async (startDate, endDate) => {
  try {
    const response = await apiClient.get(`/api/dashboard/attendance-stats?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    throw new Error("Error fetching attendance stats");
  }
};

export const getTestAttendanceStats = async () => {
  try {
    const response = await apiClient.get("/api/dashboard/test-attendance-stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching test attendance stats:", error);
    throw new Error("Error fetching test attendance stats");
  }
};

export const downloadReport = async (reportType, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      type: reportType,
      ...filters
    });
    const response = await apiClient.get(`/api/dashboard/download-report?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading report:", error);
    throw new Error("Error downloading report");
  }
};

export const getWeeklyAttendanceStats = async (weekStartDate) => {
  try {
    const response = await apiClient.get(`/api/dashboard/weekly-attendance?weekStart=${weekStartDate}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly attendance stats:", error);
    throw new Error("Error fetching weekly attendance stats");
  }
};

export const createUser = async (userData) => {
  try {
    const response = await apiClient.post("/api/user-roles/create-user", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Error creating user");
  }
};

export const getSummaryStats = async () => {
  try {
    const summaryStats = await apiClient.get("/api/report/summary");
    return summaryStats.data;
  } catch (error) {
    console.error("Error fetching summary stats:", error);
    throw new Error("Error fetching summary stats");
  }
}