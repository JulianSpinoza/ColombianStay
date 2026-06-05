import { jwtDecode } from "jwt-decode";
import httpClient from "./httpClient";
import { USERS_ENDPOINTS } from "./endpoints";

let refreshPromise = null;

export function getAccessToken() {
    return localStorage.getItem("access");
}

export function getRefreshToken() {
    return localStorage.getItem("refresh");
}

export function saveTokens(access, refresh = null) {

    localStorage.setItem("access", access);

    if (refresh) {
        localStorage.setItem("refresh", refresh);
    }
}

export function clearTokens() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
}

export function isTokenExpired(token) {

    if (!token) return true;

    try {

        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        return decoded.exp < now + 30;

    } catch {
        return true;
    }
}

export async function refreshAccessToken() {

    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {

        const refresh = getRefreshToken();

        if (!refresh) {
            throw new Error("No refresh token");
        }

        const response = await httpClient.post(
            USERS_ENDPOINTS.REFRESH,
            {
                refresh,
            }
        );

        const newAccess = response.data.access;

        saveTokens(newAccess);

        return newAccess;

    })();

    try {

        return await refreshPromise;

    } finally {

        refreshPromise = null;
    }
}