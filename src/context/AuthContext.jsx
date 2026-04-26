import { useMemo, useState } from "react";
import { clearAuthStorage, getStoredAuth, setAuthToken, setStoredUser } from "../services/authService";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());

  const login = ({ token, user }) => {
    if (token && user) {
      setAuthToken(token, user);
    } else if (user) {
      setStoredUser(user);
    }
    setAuth(getStoredAuth());
  };

  const logout = () => {
    clearAuthStorage();
    setAuth({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      token: auth?.token || null,
      user: auth?.user || null,
      isAuthenticated: Boolean(auth?.user || auth?.token),
      login,
      logout,
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
