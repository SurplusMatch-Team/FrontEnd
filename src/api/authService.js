import axios from "axios";

const API = axios.create({
  baseURL: "https://contemptibly-septemviral-apollo.ngrok-free.dev/api",
});

export const registerUser = async (data) => {
  try {
    const res = await API.post("/auth/register", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Register failed" };
  }
};

export const loginUser = async (data) => {
  try {
    const res = await API.post("/auth/login", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};