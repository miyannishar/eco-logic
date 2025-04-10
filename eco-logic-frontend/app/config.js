/**
 * Application configuration
 */

const config = {
  // API base URL for external services
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000', // Default to local development server
  
  // Other configuration settings can be added here
};

export default config; 