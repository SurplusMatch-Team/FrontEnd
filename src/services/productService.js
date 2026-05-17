import API from "./api";
import { apiErrorMessage } from "../utils/apiErrorMessage";
import { asApiArray } from "../utils/surplusApi";

const extractMessage = (error, fallback) => apiErrorMessage(error, fallback);

export const getProducts = async () => {
  try {
    const res = await API.get("/products");
    return res.data.data || res.data; 
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to fetch products"));
  }
};

export const createProduct = async (productData) => {
  try {
    const res = await API.post("/products/add", productData);
    return res.data.data || res.data; 
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to create product"));
  }
};

export const getUrgentProducts = async () => {
  try {
    const res = await API.get("/products/urgent");
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to fetch urgent products"));
  }
};

export const getProductsByOwner = async (ownerId) => {
  try {
    const res = await API.get(`/products/market/${ownerId}`); 
    return asApiArray(res.data);
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to fetch your products"));
  }
};

export const getAvailableProducts = async () => {
  try {
    const res = await API.get("/products");
    return asApiArray(res.data);
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to fetch available products"));
  }
};

export const deleteProduct = async (productId, { ownerId }) => {
  try {
    const res = await API.delete(`/products/${productId}`, { data: { ownerId } });
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to delete product"));
  }
};

export const updateProduct = async (id, data) => {
  try {
    const res = await API.patch(`/products/${id}`, data);
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to update product"));
  }
};

export const getNearbyProducts = async (city, district) => {
  try {
    const res = await API.get(`/products/nearby`, {
      params: { city, district }
    });
    return res.data;
  } catch (error) {
    throw new Error("The nearby products could not be fetched. Please try again later.");
  }
};