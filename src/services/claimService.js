import API from "./api";

export const createClaim = async (claimData) => {
  const res = await API.post("/claims", claimData);
  return res.data;
};