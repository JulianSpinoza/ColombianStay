import axios from "axios";
import { BACKENDDJANGO } from "./endpoints";

const httpClient = axios.create({
  baseURL: BACKENDDJANGO, // URL del backend Django
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default httpClient;