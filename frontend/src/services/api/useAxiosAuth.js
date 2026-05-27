import { useReducer } from "react";
import { jwtDecode } from "jwt-decode";

export function useAxiosAuth() {
  const initialState = {
    access: null,
    refresh: null,
    user: null,
    isAuthenticated: false,
  };

  function authReducer(state, action) {
    switch (action.type) {
      case "LOGIN":
        localStorage.setItem("access", action.payload.access);
        localStorage.setItem("refresh", action.payload.refresh);

        return {
          ...state,
          access: action.payload.access,
          refresh: action.payload.refresh,
          user: action.payload.user,
          isAuthenticated: true,
        };

      case "LOGOUT":
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        return initialState;

      case "REFRESH":
        localStorage.setItem("access", action.payload.access);

        return {
          ...state,
          access: action.payload.access,
        };

      default:
        return state;
    }
  }

  const getLocalSession = () => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    if (access && refresh) {
      try {
        const user = jwtDecode(access);

        return {
          access,
          refresh,
          user,
          isAuthenticated: true,
        };
      } catch (error) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        return initialState;
      }
    }

    return initialState;
  };

  const [state, dispatch] = useReducer(authReducer, null, getLocalSession);

  return {
    state,
    dispatch,
  };
}