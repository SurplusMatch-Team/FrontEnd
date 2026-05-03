import API from "./api";

const extractMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const unwrapData = (responseData) => responseData?.data ?? responseData;

export const getProducts = async () => {
  try {
    const res = await API.get("/products");
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(extractMessage(error, "Failed to fetch products"));
  }
};

export const createProduct = async (productData) => {
  try {
    const res = await API.post("/products", productData);
    return unwrapData(res.data);
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
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to fetch your products");
  }
};

export const getAvailableProducts = async () => {
  try {
    const res = await API.get("/products"); 
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to fetch available products");
  }
};

export const deleteProduct = async (productId, data = undefined) => {
  try {
    const res = await API.delete(`/products/${productId}`, data ? { data } : undefined);
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to delete product");
  }
};

export const updateProduct = async (id, data) => {
  try {
    const res = await API.patch(`/products/${id}`, data);
    return unwrapData(res.data);
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to update product");
  }
};