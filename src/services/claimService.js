import API from "./api";

const extractMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const createClaim = async (claimData) => {
  try {
    const res = await API.post("/claims", claimData);
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to create claim"));
  }
};