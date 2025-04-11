/**
 * API utility functions for making requests to backend services
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const error = new Error('API request failed');
      error.status = response.status;
      error.statusText = response.statusText;
      
      try {
        error.data = await response.json();
      } catch (e) {
        error.data = null;
      }
      
      throw error;
    }
    
    // Check if the response has JSON content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

// Exported API methods
export const api = {
  get: (endpoint, options = {}) => 
    fetchAPI(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, data, options = {}) => 
    fetchAPI(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: (endpoint, data, options = {}) => 
    fetchAPI(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (endpoint, options = {}) => 
    fetchAPI(endpoint, { ...options, method: 'DELETE' }),
  
  // Special method for form data (file uploads)
  uploadForm: async (endpoint, formData, options = {}) => {
    return fetchAPI(endpoint, {
      ...options,
      method: 'POST',
      headers: {}, // Let browser set the correct content type with boundary
      body: formData,
    });
  },
}; 