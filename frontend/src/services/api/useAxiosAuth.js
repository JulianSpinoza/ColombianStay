import { USERS_ENDPOINTS } from "./endpoints";
import { useEffect, useReducer } from "react";
import { jwtDecode } from "jwt-decode";
import httpClient from "./httpClient";

export function useAxiosAuth () {

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

  // Initial charge of localStorage JWT
  const getLocalSession = () => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    if (access && refresh) {
      const user = jwtDecode(access);
      return {
        access: access,
        refresh: refresh,
        user: user,
        isAuthenticated: true,
      };
    }

    return initialState;
  }

  const [state, dispatch] = useReducer(authReducer, null, getLocalSession);

  const isTokenExpired = (token) => {
    if (!token) return true;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;

    return payload.exp < now + 30;
  };

  useEffect(() => {
    const requestId = httpClient.interceptors.request.use(
      async (config) => {
        // Access token expired
        if (state.access && isTokenExpired(state.access)) {
          
          // This refresh should be secured by an security cookie
          refreshPromise = httpClient
            .post(USERS_ENDPOINTS.REFRESH,
              {
                refresh: state?.refresh,
              })
            .then((res) => {
              const newAccess = res.data.access;

              dispatch({
                type: "REFRESH",
                payload: { access: newAccess },
              });

              localStorage.setItem("access", newAccess);
              return newAccess;
            })
            .catch((e) => {
              dispatch({ type: "LOGOUT" });
              throw e;
            });
          
            const newAccess = await refreshPromise;
            config.headers.Authorization = `Bearer ${newAccess}`;
        } else if (state.access) {
          config.headers.Authorization = `Bearer ${state.access}`;
        } 
        return config;
      },
      (err) => Promise.reject(err),
    );

    const responseId = httpClient.interceptors.response.use(
      (res) => res,
      (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          dispatch({ type: "LOGOUT" });
        }
      },
    );

    return () => {
      httpClient.interceptors.request.eject(requestId);
      httpClient.interceptors.response.eject(responseId);
    };
  }, [state?.access, state?.refresh, dispatch]);

  return {
    state,
    dispatch,
  };
}
