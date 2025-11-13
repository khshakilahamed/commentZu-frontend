import type { IGenericErrorResponse } from "@/types";
import axios from "axios";

// Create a custom axios instance
const axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL, // from your .env file
      withCredentials: true, // optional — if you use cookies
});

// Request interceptor
axiosInstance.interceptors.request.use(
      (config) => {
            // Add token to headers if available
            const token = localStorage.getItem("accessToken");

            if (token) {
                  config.headers.Authorization = token;
            }

            // Example: add custom headers
            config.headers["X-Requested-With"] = "XMLHttpRequest";

            return config;
      },
      (error) => {
            // Handle request error
            return Promise.reject(error);
      }
);

// Response interceptor
axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
            if (error.response) {
                  // Handle 401 Unauthorized
                  if (error.response.status === 401) {
                        console.warn("Unauthorized! Redirecting to login...");
                        // Example: redirect or clear token
                        localStorage.removeItem("accessToken");
                        window.location.href = "/login";
                  }
            }
            const responseObject: IGenericErrorResponse = {
                  statusCode: error?.response?.data?.statusCode || 500,
                  message: error?.response?.data?.message || "Something went wrong",
                  errorMessages: error?.response?.data?.message,
            };
            // return responseObject;
            return Promise.reject(responseObject);
      }
);

export default axiosInstance;
