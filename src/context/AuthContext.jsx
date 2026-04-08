import { useMemo, useState } from "react";
import { clearAuthStorage, getStoredAuth, setAuthToken } from "../services/authService";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());

  const login = ({ token, user }) => {
    setAuthToken(token, user);
    setAuth({ token, user });
  };

  const logout = () => {
    clearAuthStorage();
    setAuth({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      token: auth?.token || null,
      user: auth?.user || null,
      isAuthenticated: Boolean(auth?.token),
      login,
      logout,
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

