import axios from "axios";
import { BACKENDDJANGO } from "./endpoints";
import { useEffect, useMemo, useReducer } from "react";
import { jwtDecode } from "jwt-decode";

export function useAxiosAuth () {

  const initialState = {
    access: null,
    refresh: null,
    user: null,       
    isAuthenticated: false
  };

  const [state, dispatch] = useReducer(authReducer, initialState);
  
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

  const axiosInstance = useMemo(() => { 
    return axios.create({
      baseURL: BACKENDDJANGO,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      }
    });
  }, []);

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

  useEffect(() => {
    const requestId = axiosInstance.interceptors.request.use(
      config => {
        if (state.access) {
          config.headers.Authorization = `Bearer ${state.access}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    const responseId = axiosInstance.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;

        // Access token expired
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;

          try {
            const refreshRes = await axios.post(`${BACKENDDJANGO}refresh/`, {
              refresh: state?.refresh
            });

            const newAccess = res.data.access;

            // Update Access token
            dispatch({
              type: "REFRESH",
              payload: { access: newAccess }
            });
            
            localStorage.setItem("access", newAccess);

            // Retry petition with the new Access token
            original.headers.Authorization = `Bearer ${newAccess}`;
            return axiosInstance(original);

          } catch (e) {

            dispatch({ type: "LOGOUT" });
            return Promise.reject(e);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestId);
      axiosInstance.interceptors.response.eject(responseId);
    };
  }, [axiosInstance, state?.access, state?.refresh, dispatch]);

  return {
    state,
    dispatch,
    axiosInstance
  };
}
