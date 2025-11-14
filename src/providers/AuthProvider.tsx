import { AuthContext } from "@/contexts/AuthContext";
import type { TUser } from "@/types";
import { useEffect, useState, type ReactNode } from "react";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load user from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
  }, []);

  // store data to localStorage
  const storeData = (userData: TUser, token: string) => {
    setUser(userData);
    setAccessToken(token);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", token);
  };

  // Logout and clear from local storage
  const logout = () => {
    setUser(null);
    setAccessToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: (!!user?.email && !!accessToken),
        storeData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};