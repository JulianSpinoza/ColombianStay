import { createContext, useContext } from "react";
import { useAxiosAuth } from "../../../services/api/useAxiosAuth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  
  const contextValue = useAxiosAuth();

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
