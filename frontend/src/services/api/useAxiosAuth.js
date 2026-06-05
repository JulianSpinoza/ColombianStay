import { useReducer, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { clearTokens, getAccessToken, getRefreshToken, isTokenExpired, refreshAccessToken } from "./authService";

const initialState = {
    access: null,
    refresh: null,
    user: null,
    isAuthenticated: false,
};

function authReducer(state, action) {

    switch (action.type) {

        case "LOGIN":
            return {
                access: action.payload.access,
                refresh: action.payload.refresh,
                user: action.payload.user,
                isAuthenticated: true,
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

function getLocalSession() {

    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    if (!access || !refresh) {
        return initialState;
    }

    return {
        access,
        refresh,
        user: jwtDecode(access),
        isAuthenticated: true,
    };
}

export function useAxiosAuth() {

    const [authReady, setAuthReady] =
        useState(false);

    const [state, dispatch] = useReducer(
        authReducer,
        null,
        getLocalSession
    );

    async function initializeAuthentication() {

        const access =
            getAccessToken();

        const refresh =
            getRefreshToken();

        if (!refresh) {

            setAuthReady(true);
            return;
        }

        try {

            if (
                !access ||
                isTokenExpired(access)
            ) {
                await refreshAccessToken();
            }

        } catch {
            clearTokens();
        }
        
        setAuthReady(true);
    }
    

    return {
        state,
        dispatch,
        initializeAuthentication,
        authReady,
    };
}