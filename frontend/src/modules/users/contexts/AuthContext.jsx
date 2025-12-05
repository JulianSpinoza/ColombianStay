import { createContext, useReducer, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

const initialState = {
  access: null,
  refresh: null,
  user: null,       
  isAuthenticated: false
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        access: action.payload.access,
        refresh: action.payload.refresh,
        user: action.payload.user,
        isAuthenticated: true
      };
    case "LOGOUT":
      return initialState;

    case "REFRESH":
      return {
        ...state,
        access: action.payload.access,
      };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initial charge of localStorage JWT
  useEffect(() => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    if (access && refresh) {
      const user = jwtDecode(access);
      dispatch({
        type: "LOGIN",
        payload: { access, refresh, user }
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
