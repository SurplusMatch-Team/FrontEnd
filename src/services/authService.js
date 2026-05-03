import API from "./api";

const TOKEN_KEY = "replate_auth_token";
const USER_KEY = "replate_auth_user";

const extractMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const setAuthToken = (token, user) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/** Backward compatible: persist user only (e.g. backend returns user without JWT). */
export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete API.defaults.headers.common.Authorization;
};

export const getStoredAuth = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  return { token, user };
};

export const loginUser = async (data) => {
  try {
    const res = await API.post("/auth/login", data);

    const token = res.data.token || res.data.accessToken;
    const user = res.data.user;
    if (token && user) {
      setAuthToken(token, user);
    } else if (user) {
      setStoredUser(user);
    } else if (token) {
      setAuthToken(token, null);
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
