import axios from 'axios';
import Constants from 'expo-constants';

// Determine the API base URL based on the environment
const getApiUrl = (): string => {
  // Check if we're in development mode
  const isDev = __DEV__;

  if (isDev) {
    // For local development
    // iOS Simulator: use localhost
    // Android Emulator: use 10.0.2.2 (special IP that maps to host machine's localhost)
    // Physical Device: use your computer's IP address on local network
    const { platform } = Constants;

    if (platform?.ios) {
      return 'http://localhost:3000/api';
    } else if (platform?.android) {
      return 'http://10.0.2.2:3000/api';
    }

    // Fallback for web or other platforms
    return 'http://localhost:3000/api';
  }

  // Production URL (update this when you deploy)
  return 'https://your-production-api.com/api';
};

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    // TODO: Add JWT token from AsyncStorage when auth is implemented
    // const token = await AsyncStorage.getItem('@flit_auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          // TODO: Implement auth logout when auth is added
          console.error('Unauthorized access - please login');
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error - please try again later');
          break;
        default:
          console.error('API Error:', data?.message || error.message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - please check your connection');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors consistently
export const handleApiError = (error: any): Error => {
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }
  if (error.message) {
    return new Error(error.message);
  }
  return new Error('An unexpected error occurred');
};
