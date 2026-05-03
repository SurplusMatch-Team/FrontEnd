import API from "./api";

const extractMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;
const unwrapData = (responseData) => responseData?.data ?? responseData;

export const createClaim = async (claimData) => {
  try {
    const res = await API.post("/claims", claimData);
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to create claim"));
  }
};

export const getClaimsByClaimant = async (claimantId) => {
  try {
    const res = await API.get(`/claims/claimant/${claimantId}`);
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to fetch your claims"));
  }
};

export const getClaimsByProduct = async (productId) => {
  try {
    const res = await API.get(`/claims/product/${productId}`);
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to fetch product claims"));
  }
};

export const approveClaim = async (claimId) => {
  try {
    const res = await API.patch(`/claims/${claimId}/approve`);
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to approve claim"));
  }
};

export const rejectClaim = async (claimId) => {
  try {
    const res = await API.patch(`/claims/${claimId}/reject`);
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to reject claim"));
  }
};

export const updateClaim = async (claimId, data) => {
  try {
    const res = await API.patch(`/claims/${claimId}`, data);
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to update claim"));
  }
};

export const withdrawClaim = async (claimId, data) => {
  try {
    const res = await API.patch(`/claims/${claimId}/withdraw`, data);
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to withdraw claim"));
  }
};