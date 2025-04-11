import path from 'path';

// Determine if we're running on the server or client side
const isServer = typeof window === 'undefined';

/**
 * Get the absolute path from the project root
 * @param {string} relativePath - Path relative to project root
 * @returns {string} Absolute path from project root
 */
export function getAbsolutePath(relativePath) {
  if (isServer) {
    // Server-side: use Node.js path methods
    return path.resolve(process.cwd(), relativePath);
  } else {
    // Client-side: construct URL based on origin
    const baseUrl = window.location.origin;
    const cleanPath = relativePath.startsWith('/') 
      ? relativePath.substring(1) 
      : relativePath;
    return `${baseUrl}/${cleanPath}`;
  }
}

/**
 * Convert relative path to absolute path with baseUrl
 * Useful for import statements
 * @param {string} relativePath - Path relative to a file
 * @param {string} currentPath - Current file path
 * @returns {string} Path relative to project root
 */
export function resolveImportPath(relativePath, currentPath) {
  if (isServer) {
    return path.resolve(path.dirname(currentPath), relativePath);
  }
  return relativePath; // Client-side will use webpack/Next.js resolvers
}

/**
 * Utility functions for common paths
 */
export const paths = {
  api: '/api',
  models: '/models',
  lib: '/lib',
  components: '/components',
  public: '/public',
  
  // Function to get asset paths
  asset: (filename) => `/public/${filename}`,
  
  // API endpoint helpers
  apiEndpoint: (endpoint) => `/api/${endpoint}`,
}; 