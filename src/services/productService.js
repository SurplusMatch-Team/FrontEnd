import API from "./api";

export const getProducts = async () => {
  const res = await API.get("/products");
  return res.data;
};

export const createProduct = async (productData) => {
  const res = await API.post("/products", productData);
  return res.data;
};