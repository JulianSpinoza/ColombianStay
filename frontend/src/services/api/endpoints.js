export const BACKENDDJANGO = "/api/";

console.log(import.meta.env.VITE_API_DJANGO_URL);

export const LISTINGS_ENDPOINTS = {
  ALL: "listings/",
  SEARCH: "listings/search/",
  DETAIL: (id) => `listings/${id}/`,
  PUBLISH: "publish-listing/",
  REGION_LIST: "listings/region/",
  DEPARTMENT_LIST: (id) => `listings/region/${id}/`,
  MUNICIPALITY_LIST: (id) => `listings/department/${id}/`,
  LOCATION_TERMS: "location-terms/",
};

export const RATINGS_ENDPOINTS = {
  ALL: "ratings/",
  CREATE: "ratings/",
  HOST_RATINGS: "host-ratings/",
};

export const BOOKINGS_ENDPOINTS = {
  HOST_RESERVATIONS: "host-reservations/",
  GUEST_RESERVATIONS: "user-reservations/",
  CREATE: "bookings/",
  CANCEL: (id) => `reservations/${id}/cancel/`,
  PREINFORMATION: "bookings/preinformation/",
};

export const USERS_ENDPOINTS = {
  REGISTER: "register/",
  LOGIN: "auth/login/",
  REFRESH: "auth/refresh/",
  CONTACT_HOST: (id) => `contact_host/${id}/`,
}