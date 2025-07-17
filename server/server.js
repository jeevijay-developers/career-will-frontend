import apiClient from "./config";

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

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
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


