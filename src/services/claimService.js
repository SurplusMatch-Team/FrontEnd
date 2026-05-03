import API from "./api";

const extractMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const createClaim = async (claimData) => {
  try {
    console.log("Gönderilen Talep Verisi:", claimData); // Buraya bak!
    const res = await API.post("/claims", claimData);
    return res.data;
  } catch (error) {
    console.error("Backend Hata Detayı:", error.response?.data); // Gerçek hata burada yazar
    throw new Error(extractMessage(error, "Failed to create claim"));
  }
};

export const getClaimsByClaimant = async (claimantId) => {
  try {
    const res = await API.get(`/claims/claimant/${claimantId}`, {
      params: { _: Date.now() },
    });
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to fetch your claims"));
  }
};

export const getClaimsByProduct = async (productId) => {
  try {
    const res = await API.get(`/claims/product/${productId}`, {
      params: { _: Date.now() },
    });
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to fetch product claims"));
  }
};

export const approveClaim = async (claimId) => {
  try {
    const res = await API.patch(`/claims/${claimId}/approve`);
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to approve claim"));
  }
};

export const rejectClaim = async (claimId) => {
  try {
    const res = await API.patch(`/claims/${claimId}/reject`);
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to reject claim"));
  }
};

export const patchClaim = async (claimId, { claimantId, requestedQuantity }) => {
  const body = { claimantId, requestedQuantity };
  try {
    const res = await API.patch(`/claims/${claimId}/quantity`, body);
    return res.data;
  } catch (first) {
    // Older backends only expose PATCH /claims/{id} (no /quantity suffix).
    if (first?.response?.status === 404) {
      try {
        const res = await API.patch(`/claims/${claimId}`, body);
        return res.data;
      } catch (second) {
        throw new Error(extractMessage(second, "Failed to update claim"));
      }
    }
    throw new Error(extractMessage(first, "Failed to update claim"));
  }
};

export const withdrawClaimRequest = async (claimId, claimantId) => {
  try {
    const res = await API.patch(`/claims/${claimId}/withdraw`, { claimantId });
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to withdraw claim"));
  }
};