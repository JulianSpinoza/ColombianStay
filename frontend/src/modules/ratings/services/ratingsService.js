import { RATINGS_ENDPOINTS } from "../../../services/api/endpoints";
import httpClient from "../../../services/api/httpClient";

export const ratePropertyByBooking = async (bookingId, rating) => {
    try {
        const response = await httpClient.post(RATINGS_ENDPOINTS.RATE(bookingId), rating);
        return response.data;
    } catch (error) {
        console.error("Error to rate by booking", error);
        throw error;
    }
}