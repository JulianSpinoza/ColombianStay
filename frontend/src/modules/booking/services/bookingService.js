import { BOOKINGS_ENDPOINTS } from "../../../services/api/endpoints";
import httpClient from "../../../services/api/httpClient";

export const bookAProperty = async (property) => {
    try {
        const response = await httpClient.post(BOOKINGS_ENDPOINTS.CREATE, property);
        return response.data;
    } catch (error) {
        console.error("Error to book the property", error);
        throw error;
    }
};

export const getGuestReservations = async (query = {}) => {
    try {
        const response = await httpClient.get(BOOKINGS_ENDPOINTS.GUEST_RESERVATIONS,{
            params: query,
        })
        return response.data;
    } catch (error) {
        console.error("Error to retrieve the guest reservations", error);
        throw error;
    }
};

export const getHostReservations = async (query = {}) => {
    try {
        const response = await httpClient.get(BOOKINGS_ENDPOINTS.HOST_RESERVATIONS,{
            params: query,
        })
        return response.data;
    } catch (error) {
        console.error("Error to retrieve the host reservations", error);
        throw error;
    }
};