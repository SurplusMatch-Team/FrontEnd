import { useMemo, useState } from "react";
import { clearAuthStorage, getStoredAuth, setStoredUser } from "../services/authService";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());

  const login = ({ user }) => {
    setStoredUser(user);
    setAuth({ user });
  };

  const logout = () => {
    clearAuthStorage();
    setAuth({ user: null });
  };

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      isAuthenticated: Boolean(auth?.user),
      login,
      logout,
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}