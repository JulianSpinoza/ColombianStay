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

export const getBookingTotalPrice = async (query) => {
    try {
        const response = await httpClient.post(BOOKINGS_ENDPOINTS.TOTAL_PRICE, query)
        return response.data;
    } catch (error) {
        console.error("Error to retrieve total price calculation", error);
        throw error;
    }
}

export const getBookedDates = async (listingId) => {
    try {
        const response = await httpClient.get(BOOKINGS_ENDPOINTS.BOOKED_DATES(listingId))
        return response.data;
    } catch (error) {
        console.error("Error to retrieve the booked dates", error);
        throw error;
    }
}

export const cancelReservationAsGuest = async (reservationId) => {
    try {
        const response = await httpClient.patch(BOOKINGS_ENDPOINTS.CANCEL_AS_GUEST(reservationId))
        return response.data;
    } catch (error) {
        console.error("Error to cancel a reservation as guest", error);
        throw error;
    }
}

export const cancelReservationAsHost = async (reservationId, reason) => {
    try {
        const response = await httpClient.patch(BOOKINGS_ENDPOINTS.CANCEL_AS_HOST(reservationId), {
            reason: reason.trim()
        })
        return response.data;
    } catch (error) {
        console.error("Error to cancel a reservation as host", error);
        throw error;
    }
}