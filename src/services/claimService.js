import API from "./api";
import { apiErrorMessage } from "../utils/apiErrorMessage";
import { asApiArray } from "../utils/surplusApi";

const extractMessage = (error, fallback) => apiErrorMessage(error, fallback);

export const createClaim = async (claimData) => {
  try {
    const res = await API.post("/claims", claimData);
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to create claim"));
  }
};

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

export const getClaimsByClaimant = async (claimantId) => {
  try {
    const res = await API.get(`/claims/claimant/${claimantId}`, {
      params: { _: Date.now() },
      headers: noStoreHeaders,
    });
    return asApiArray(res.data);
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to fetch your claims"));
  }
};

export const getClaimsByOwner = async (ownerId) => {
  try {
    const res = await API.get(`/claims/owner/${ownerId}`);
    return res.data;
  } catch (error) {
    throw new Error(error?.response?.data || "Talepler getirilemedi");
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
  const cid = parseInt(String(claimantId), 10);
  const qty = parseInt(String(requestedQuantity), 10);
  const body = { claimantId: cid, requestedQuantity: qty };
  const id = encodeURIComponent(String(claimId));
  try {
    const res = await API.patch(`/claims/${id}`, body, {
      headers: { "Content-Type": "application/json", ...noStoreHeaders },
    });
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to update claim"));
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