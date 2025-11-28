import httpClient from "../../../services/api/httpClient";

/**
 * Trae todos los listings o los filtra según parámetros.
 * @param {Object} filters - Objeto con filtros opcionales.
 * @returns {Promise<Array>} Lista de listings.
 */

export const getListings = async (query = {}) => {
  try {
    const response = await httpClient.get("listings/", {
      params: query, 
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};