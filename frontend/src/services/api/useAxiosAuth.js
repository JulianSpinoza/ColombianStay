import axios from "axios";
import { BACKENDDJANGO } from "./endpoints";
import { useAuthContext } from "../../modules/users/contexts/AuthContext";

export function useAxiosAuth () {

  const { state, dispatch } = useAuthContext();

  const axiosInstance = axios.create({
    baseURL: BACKENDDJANGO,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.request.use(config => {
    if (state.access) {
      config.headers.Authorization = `Bearer ${state.access}`;
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    res => res,
    async error => {
      const original = error.config;

      // Access token expired
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;

        try {
          const res = await axios.post(`${BACKENDDJANGO}refresh/`, {
            refresh: state.refresh
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

  return axiosInstance;
}
