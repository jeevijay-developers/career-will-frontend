import apiClient from "./config";

// Kits api
export const getAllKits = async () => {
  try {
    const response = await apiClient.get("/api/kit/get-all-kits");    
    return response.data;
  } catch (error) {
    console.error("Error fetching kits:", error);
    throw error;
  }
} 
export const createKit = async (kitData) => {
  try {
    const response = await apiClient.post("/api/kit/create-kit", kitData);
    return response.data;
  } catch (error) {
    console.error("Error creating kit:", error);
    throw error;
  }
}

// User authentication APIs
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
} 

// Student APIs
export const createStudent = async (studentData) => {
  try {
    const response = await apiClient.post("/api/student/create-student", studentData);
    return response.data;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
}
 export const uploadStudentImage = async (formData) => {
  try {
    const response = await apiClient.post("/api/student/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading student image:", error);
    throw error;
  }
}

export const getAllBatches = async () => {
  try {
    const response = await apiClient.get("/api/batch/get-all-batches");
    return response.data;
  } catch (error) {
    console.error("Error fetching batches:", error);
    throw error;
  }
};

export const createBatch = async (batchData) => {
  try {
    const response = await apiClient.post("/api/batch/create-batch", batchData);
    return response.data;
  } catch (error) {
    console.error("Error creating batch:", error);
    throw error;
  }
};


