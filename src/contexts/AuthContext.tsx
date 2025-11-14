import type { TUser } from "@/types";
import { createContext } from "react";

interface AuthContextType {
  user: TUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  storeData: (user: TUser, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


