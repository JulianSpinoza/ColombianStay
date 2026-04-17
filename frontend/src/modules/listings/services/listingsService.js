import { LISTINGS_ENDPOINTS } from "../../../services/api/endpoints.js";
import httpClient from "../../../services/api/httpClient.js";

/**
 * Retrieves listings and suggested listings if the backend provides them.
 * Supports both:
 * - old response: []
 * - new response: { results: [], suggestions: [] }
 */

export const getListings = async (query = {}) => {
  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.ALL, {
      params: query,
    });

    const data = response?.data;

    if (!data) {
      return {
        results: [],
        suggestions: [],
      };
    }

    if (Array.isArray(data)) {
      return {
        results: data,
        suggestions: [],
      };
    }

    return {
      results: data.results || data.exact_matches || [],
      suggestions: data.suggestions || data.suggested_properties || [],
    };
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};
export const publishProperty = async (property) => {
  try {
    const response = await httpClient.post(LISTINGS_ENDPOINTS.PUBLISH, property);
    return response.data;
  } catch (error) {
    console.error("Error publishing property: ", error);
    throw error;
  }
};

export const getSpecificListing = async (id) => {
  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.DETAIL(id));
    return response.data;
  } catch (error) {
    console.error(`Error retrieving the listing with id ${id}: `, error);
    throw error;
  }
};