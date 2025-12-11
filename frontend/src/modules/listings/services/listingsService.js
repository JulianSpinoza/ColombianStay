import { LISTINGS_ENDPOINTS } from "../../../services/api/endpoints.js";
import httpClient from "../../../services/api/httpClient.js";

/**
 * It retrieves all listings or filters them according to parameters.
 * @param {Object} filters - Object with optional filters.
 * @returns {Promise<Array>} List of listings.
 */

export const getListings = async (query = {}) => {

  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.ALL, {
      params: query, 
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};

export const publishProperty = async (property, privateConnection) => {
  try {
    const response = await privateConnection.post(LISTINGS_ENDPOINTS.PUBLISH, property);
  } catch (error) {
    console.error("Error publishing property:", error);
    throw error;
  }
}