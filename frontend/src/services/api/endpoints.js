export const BACKENDDJANGO = "http://localhost:8000/api/";

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
  RATE: (id) => `rating/booking/${id}/`,
  HOST_RATINGS: "host-ratings/",
};

export const BOOKINGS_ENDPOINTS = {
  HOST_RESERVATIONS: "host-reservations/",
  GUEST_RESERVATIONS: "user-reservations/",
  CREATE: "bookings/",
  CANCEL_AS_GUEST: (id) => `reservations/${id}/cancel/guest/`,
  CANCEL_AS_HOST: (id) => `reservations/${id}/cancel/host/`,
  TOTAL_PRICE: "bookings/total_price/",
  BOOKED_DATES: (id) => `bookings/${id}/`,
};

export const USERS_ENDPOINTS = {
  REGISTER: "register/",
  LOGIN: "auth/login/",
  REFRESH: "auth/refresh/",
  CONTACT_HOST: (id) => `contact_host/${id}/`,
  INFO_ME: "profile/me/",
}