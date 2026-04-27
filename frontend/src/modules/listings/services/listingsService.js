import { LISTINGS_ENDPOINTS } from "../../../services/api/endpoints.js";
import httpClient from "../../../services/api/httpClient.js";

/**
 * Recibe los datos del formulario y los prepara para el backend.
 * HU36: Frontend correctly sends data, images, and availability.
 */
export const publishProperty = async (propertyData) => {
  try {
    // 1. Preparamos el FormData (Necesario para enviar imágenes a Django)
    const formData = new FormData();

    // 2. Mapeamos los datos del objeto al FormData
    // Esto asegura que cumplimos con el "Contrato" de la HU37
    Object.keys(propertyData).forEach((key) => {
      if (key === 'images' && Array.isArray(propertyData[key])) {
        // Si son imágenes, las agregamos una por una
        propertyData[key].forEach((image) => {
          formData.append('images', image);
        });
      } else if (typeof propertyData[key] === 'object' && propertyData[key] !== null) {
        // Para objetos complejos (como disponibilidad o amenities), los enviamos como string JSON
        formData.append(key, JSON.stringify(propertyData[key]));
      } else {
        formData.append(key, propertyData[key]);
      }
    });

    // 3. Enviamos la petición
    const response = await httpClient.post(LISTINGS_ENDPOINTS.PUBLISH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Retornamos la data para que el componente maneje la "Aprobación"
    return response.data; 

  } catch (error) {
    // Capturamos el error para que el componente maneje la "Denegación"
    // Si el backend responde con errores de validación (400), los lanzamos para el catch del componente
    if (error.response && error.response.data) {
        throw error.response.data;
    }
    console.error("Error publishing property: ", error);
    throw error;
  }
};

// Los demás métodos (getListings y getSpecificListing) están perfectos y no requieren cambios.
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

export const getSpecificListing = async (id) => {
  try {
    const response = await httpClient.get(LISTINGS_ENDPOINTS.DETAIL(id));
    return response.data;
  } catch (error) {
    console.error(`Error retrieving the listing with id ${id}: `, error);
    throw error;
  }
};