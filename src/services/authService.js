import API from "./api";
import { apiErrorMessage } from "../utils/apiErrorMessage";

const TOKEN_KEY = "replate_auth_token";
const USER_KEY = "replate_auth_user";

const extractMessage = (error, fallback) => apiErrorMessage(error, fallback);

export function normalizeAuthUser(user) {
  if (!user || typeof user !== "object") return user;
  const addr = user.address && typeof user.address === "object" ? user.address : null;
  const city = user.city ?? addr?.city ?? null;
  const district = user.district ?? addr?.district ?? null;
  const fullAddress = user.fullAddress ?? addr?.fullAddress ?? addr?.full_address ?? null;
  return {
    ...user,
    city,
    district,
    fullAddress,
    address: addr ?? (city || district || fullAddress ? { city, district, fullAddress } : undefined),
  };
}

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
      user = normalizeAuthUser(JSON.parse(userRaw));
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
    const user = normalizeAuthUser(res.data.user);
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
