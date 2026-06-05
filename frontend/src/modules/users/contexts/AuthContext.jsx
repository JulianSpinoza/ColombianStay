import { createContext, useContext, useEffect } from "react";
import { useAxiosAuth } from "../../../services/api/useAxiosAuth";
import ApiState from "../../../global/components/ApiState/ApiState";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const {
    state,
    dispatch,
    initializeAuthentication,
    authReady,
  } = useAxiosAuth()

  useEffect(() => {
    initializeAuthentication();
  })

  if(!authReady){
    return <ApiState type='loading'/>
  }
  
  const contextValue = {
    state: state,
    dispatch: dispatch
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
