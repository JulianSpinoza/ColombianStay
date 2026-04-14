export const BACKENDDJANGO = "http://localhost:8000/api/";

export const LISTINGS_ENDPOINTS = {
  ALL: "listings/",
  SEARCH: "listings/search/",
  DETAIL: (id) => `listings/${id}/`,
  PUBLISH: "publish-listing/",
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
};

export const USERS_ENDPOINTS = {
  REGISTER: "register/",
  LOGIN: "auth/login/",
  REFRESH: "auth/refresh/"
}