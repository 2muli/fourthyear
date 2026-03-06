// API Configuration
export const API_CONFIG = {
  // For Android emulator, use 10.0.2.2 to access your localhost
  // For iOS simulator, use 'localhost' or your machine's IP
  BASE_URL: __DEV__ ? 'http://10.0.2.2:8800' : 'https://your-production-api.com',
  ENDPOINTS: {
    CHAT: '/api/chat/ask',
  },
  TIMEOUT: 15000, // 15 seconds
};

// Helper function to build API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default {
  API_CONFIG,
  getApiUrl,
};
