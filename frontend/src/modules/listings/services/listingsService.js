import { LISTINGS_ENDPOINTS } from "../../../services/api/endpoints.js";
import httpClient from "../../../services/api/httpClient.js";

/**
 * It retrieves all listings or filters them according to parameters.
 * @param {Object} query - Object with optional filters.
 * @returns {Promise<Array>} List of listings.
 */
export const getListings = async (query = {}) => {
  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.ALL, {
      params: query, 
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching listings: ", error);
    throw error;
  }
};

/**
 * Sends property data to the backend to create and publish a new ad.
 * Required for HU36: Consume Create Accommodation API.
 * @param {FormData|Object} property - The property data to be published.
 * @returns {Promise<Object>} Backend response (Approval or Denial).
 */
export const publishProperty = async (property) => {
  try {
    // Agregamos 'return' y 'response.data' para capturar la aprobación/denegación del backend
    // Se recomienda usar Content-Type: multipart/form-data si se envían imágenes (HU42)
    const response = await httpClient.post(LISTINGS_ENDPOINTS.PUBLISH, property, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data; 
  } catch (error) {
    console.error("Error publishing property: ", error);
    throw error;
  }
};

/**
 * Retrieves detailed information for a specific listing by ID.
 * @param {string|number} id - The unique identifier of the listing.
 * @returns {Promise<Object>} Detailed listing data.
 */
export const getSpecificListing = async (id) => {
  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.DETAIL(id));
    return response.data;
  } catch (error) {
    console.error(`Error retrieving the listing with id ${id}: `, error);
    throw error;
  }
};