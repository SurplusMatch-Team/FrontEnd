import API from "./api";

export const loginUser = async (data) => {
  try {
    const res = await API.post("/auth/login", data);

    if (res.data.user) {
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const registerUser = async (data) => {
  try {
    const res = await API.post("/auth/register", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Register failed" };
  }
};