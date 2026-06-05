import axios from "axios";
import { BACKENDDJANGO } from "./endpoints";
import { clearTokens, getAccessToken, isTokenExpired, refreshAccessToken } from "./authService";

const httpClient = axios.create({
  baseURL: BACKENDDJANGO, // URL del backend Django
  timeout: 10000,
});

httpClient.interceptors.request.use(
  async (config) => {

      if (config.url?.includes("refresh")) {
          return config;
      }

      let access = getAccessToken();

      if (!access) {
          return config;
      }

      if (isTokenExpired(access)) {

          try {

              access = await refreshAccessToken();

          } catch {

              clearTokens();
              return config;
          }
      }

      config.headers.Authorization =
          `Bearer ${access}`;

      return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {

      const status = error.response?.status;

      if (status === 401 || status === 403) {
          clearTokens();
      }

      return Promise.reject(error);
  }
);

export default httpClient;