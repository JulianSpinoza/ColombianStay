import axios from "axios";

const httpClient = axios.create({
  baseURL: "http://localhost:8000/api/", // URL del backend Django
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default httpClient;