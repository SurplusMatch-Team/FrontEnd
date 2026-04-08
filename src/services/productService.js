import API from "./api";

export const getProducts = async () => {
  try {
    const res = await API.get("/products");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch products" };
  }
};

export const createProduct = async (productData) => {
  try {
    const res = await API.post("/products", productData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create product" };
  }
};