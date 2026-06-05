import { USERS_ENDPOINTS } from "../../../services/api/endpoints";
import httpClient from "../../../services/api/httpClient";

/**
 * It retrieves all information of the certain user
 * @param {Object} filters - Credentials of the user
 * @returns {Promise<Array>} Información del usuario if successful
 */

export const registerUser = async (user) => {
    try {
        const response = await httpClient.post(USERS_ENDPOINTS.REGISTER, user);
    } catch (error){
        console.error("Error register the user:", error);
        throw error;
    }
};

export const loginUser = async (credentials) => {
    
    try {
        const response = await httpClient.post(USERS_ENDPOINTS.LOGIN, credentials);
        return response.data
    } catch (error) {
        console.error("Error loging in the user:", error);
        throw error;
    }
}

export const getPersonalInfo = async () => {

    try {
        const response = await httpClient.get(USERS_ENDPOINTS.INFO_ME);
        return response.data
    } catch (error) {
        console.error("Error getting my personal information:", error);
        throw error;
    }

}

export const updatePersonalInfo = async (updateInfo) => {

    try {
        const response = await httpClient.patch(USERS_ENDPOINTS.INFO_ME, updateInfo);
        return response.data
    } catch (error) {
        console.error("Error updating my personal information:", error);
        throw error;
    }

}