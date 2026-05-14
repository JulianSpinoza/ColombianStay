import { LISTINGS_ENDPOINTS, USERS_ENDPOINTS } from "../../../services/api/endpoints.js";
import httpClient from "../../../services/api/httpClient.js";

/**
 * Retrieves listings and suggested listings if the backend provides them.
 * Supports both:
 * - old response: []
 * - new response: { results: [], suggestions: [] }
 */

export const getListings = async () => {

  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.ALL);
    return response.data;
  } catch (error) {
    console.error("Error fetching listings:", error);
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
}

export const getRegionList = async () => {
  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.REGION_LIST);
    return response.data;
  } catch (error) {
    console.error(`Error retrieving the region list: `, error);
    throw error;
  }
}

export const getDepartmentList = async (id) => {
  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.DEPARTMENT_LIST(id));
    return response.data;
  } catch (error) {
    console.error(`Error retrieving the department list of region with id ${id}: `, error);
    throw error;
  }
}

export const getMunicipalityList = async (id) => {
  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.MUNICIPALITY_LIST(id));
    return response.data;
  } catch (error) {
    console.error(`Error retrieving the municipality list of department with id ${id}: `, error);
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
};

export const getContactHost = async (id) => {
  try {
    const response = await httpClient.get(USERS_ENDPOINTS.CONTACT_HOST(id));
    return response.data;
  } catch (error) {
    console.error(`Error retrieving the contact of the host with id ${id}: `, error);
    throw error;
  }
}