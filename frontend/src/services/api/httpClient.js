import axios from "axios";
import { BACKENDDJANGO, USERS_ENDPOINTS } from "./endpoints";

const httpClient = axios.create({
  baseURL: BACKENDDJANGO,
  timeout: 10000,
});

const refreshClient = axios.create({
  baseURL: BACKENDDJANGO,
  timeout: 10000,
});

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;

    return payload.exp < now + 30;
  } catch (error) {
    return true;
  }
};

let isRefreshing = false;
let refreshPromise = null;

httpClient.interceptors.request.use(
  async (config) => {
    const isRefreshRequest = config.url?.includes("refresh");

    if (isRefreshRequest) {
      return config;
    }

    let access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    if (access && isTokenExpired(access) && refresh) {
      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = refreshClient
          .post(USERS_ENDPOINTS.REFRESH, {
            refresh,
          })
          .then((response) => {
            const newAccess = response.data.access;

            localStorage.setItem("access", newAccess);
            isRefreshing = false;

            return newAccess;
          })
          .catch((error) => {
            isRefreshing = false;

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");

            throw error;
          });
      }

      access = await refreshPromise;
    }

    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    }

    return Promise.reject(error);
  }
);

export default httpClient;