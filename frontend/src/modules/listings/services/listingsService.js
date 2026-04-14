import { LISTINGS_ENDPOINTS } from "../../../services/api/endpoints.js";
import httpClient from "../../../services/api/httpClient.js";

/**
 * It retrieves all listings or filters them according to parameters.
 * @param {Object} filters - Object with optional filters.
 * @returns {Promise<Array>} List of listings.
 */

export const getListings = async () => {

  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.ALL);
    return response.data;
  } catch (error) {
    console.error("Error fetching listings: ", error);
    throw error;
  }
};

export const getFilteredListings = async (query) => {

  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.SEARCH,{
      params:query
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching listings: ", error);
    throw error;
  }

}

export const publishProperty = async (property) => {
  try {
    const response = await httpClient.post(LISTINGS_ENDPOINTS.PUBLISH, property);
  } catch (error) {
    console.error("Error publishing property: ", error);
    throw error;
  }
}

export const getSpecificListing = async (id) => {
  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.DETAIL(id));
    return response.data;
  } catch (error) {
    console.error(`Error retrieving the listing with id ${id}: `, error);
    throw error;
  }
}

export const getLocationTerms = async () => {
  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.LOCATION_TERMS);
    return response.data;
  } catch (error) {
    console.error(`Error retrieving all the location terms: `, error);
    throw error;
  }
}