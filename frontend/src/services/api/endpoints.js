export const BACKENDDJANGO = "http://localhost:8000/api/";

export const LISTINGS_ENDPOINTS = {
  ALL: "listings/",
  DETAIL: (id) => `listings/${id}/`,
  PUBLISH: "publish-listing/"
};

export const RATINGS_ENDPOINTS = {
  ALL: "ratings/",
  CREATE: "ratings/",
  HOST_RATINGS: "host-ratings/",
};

export const USERS_ENDPOINTS = {
  REGISTER: "register/",
  LOGIN: "auth/login/",
  REFRESH: "auth/refresh/"
}