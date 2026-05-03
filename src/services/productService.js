import API from "./api";

const extractMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

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
    const res = await API.post("/products", productData);
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
    const res = await API.get(`/products/owner/${ownerId}`);
    return res.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to fetch your products");
  }
};

export const getAvailableProducts = async () => {
  try {
    const res = await API.get("/products"); 
    return res.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to fetch available products");
  }
};

export const deleteProduct = async (productId) => {
  try {
    const res = await API.delete(`/products/${productId}`);
    return res.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to delete product");
  }
};

export const updateProduct = async (id, data) => {
  const res = await API.put(`/products/${id}`, data); 
  return res.data;
};