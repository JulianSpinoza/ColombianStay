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

  useEffect(() => {
    const requestId = httpClient.interceptors.request.use(
      (config) => {
        if (state.access) {
          config.headers.Authorization = `Bearer ${state.access}`;
        }
        // Refresh reactive
        //console.log(JSON.parse(atob(state.access.split(".")[1])).exp);
        //console.log(Date.now() / 1000);
        return config;
      },
      (err) => Promise.reject(err),
    );

    const responseId = httpClient.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;

        // Access token expired
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;

          try {
            const refreshRes = await httpClient.post(USERS_ENDPOINTS.REFRESH,
              {
                refresh: state?.refresh,
              },
            );

            const newAccess = refreshRes.data.access;

            // Update Access token
            dispatch({
              type: "REFRESH",
              payload: { access: newAccess },
            });

            localStorage.setItem("access", newAccess);

            // Retry petition with the new Access token
            original.headers.Authorization = `Bearer ${newAccess}`;
            return httpClient(original);
          } catch (e) {
            dispatch({ type: "LOGOUT" });
            return Promise.reject(e);
          }
        }

        return Promise.reject(error);
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
