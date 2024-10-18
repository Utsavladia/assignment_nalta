import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Adjust based on your server URL
});

export const signup = (userData) => api.post("/auth/signup", userData);
export const login = (userData) => api.post("/auth/login", userData);

export const updateDriverLocation = (locationData) => {
  //return api.post("/driver/location", locationData);
};

export const getTrackingData = (bookingId) => api.get(`/tracking/${bookingId}`);

export const sendLocationToServer = (driverLocationObject) => {
  return api.post("/driver/location", driverLocationObject);
};

export const getDriversNearby = (location) =>
  api.get(`/driver/nearby?lat=${location.lat}&lng=${location.lng}`);

export const bookDriver = (bookingData) => api.post("/booking", bookingData);

export const getBookingDetails = (bookingId) =>
  api.get(`/detail/booking/${bookingId}`);
