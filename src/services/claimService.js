import API from "./api";

export const createClaim = async (claimData) => {
  try {
    const res = await API.post("/claims", claimData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create claim" };
  }
};