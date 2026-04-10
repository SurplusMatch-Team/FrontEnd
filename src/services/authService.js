import API from "./api";

const USER_KEY = "replate_auth_user";

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem(USER_KEY);
};

export const getStoredAuth = () => {
  const userRaw = localStorage.getItem(USER_KEY);

  let user = null;

  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  return { user };
};

const extractMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const loginUser = async (data) => {
  try {
    const res = await API.post("/auth/login", data);

    if (res.data.user) {
      setStoredUser(res.data.user);
    }

    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Login failed"));
  }
};

export const registerUser = async (data) => {
  try {
    const res = await API.post("/auth/register", data);
    return res.data;
  } catch (error) {
    throw new Error(extractMessage(error, "Register failed"));
  }
};