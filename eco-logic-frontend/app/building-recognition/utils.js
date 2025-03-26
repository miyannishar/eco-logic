/**
 * Utility functions for the Food Analysis feature
 */

/**
 * Parses response data to handle stringified JSON fields
 * @param {Object} data - API response data object
 * @returns {Object} - Data with parsed JSON strings
 */
export const parseResponseData = (data) => {
  // Handle null or undefined data
  if (!data) return {};
  
  // Create a copy to avoid mutating the original data
  const parsedData = { ...data };
  
  // Check if the data is only environmental pros and cons
  if (
    data.alternatives_to_consider &&
    data.harmful_things_about_the_product &&
    data.positive_things_about_the_product &&
    Object.keys(data).length <= 3
  ) {
    return {
      "enviromental pros and cons": data,
      "product_name": "Analyzed Product",
      "product_description": "Environmental impact analysis result"
    };
  }
  
  // Parse environmental pros and cons
  if (parsedData["enviromental pros and cons"] && typeof parsedData["enviromental pros and cons"] === 'string') {
    try {
      parsedData["enviromental pros and cons"] = JSON.parse(parsedData["enviromental pros and cons"]);
    } catch (e) {
      console.error("Error parsing environmental pros and cons:", e);
      // Provide a fallback structure instead of leaving it as an invalid string
      parsedData["enviromental pros and cons"] = {
        positive_things_about_the_product: [],
        harmful_things_about_the_product: [],
        alternatives_to_consider: []
      };
    }
  }
  
  // Parse health pros and cons
  if (parsedData["health pros and cons"] && typeof parsedData["health pros and cons"] === 'string') {
    try {
      parsedData["health pros and cons"] = JSON.parse(parsedData["health pros and cons"]);
    } catch (e) {
      console.error("Error parsing health pros and cons:", e);
      // Provide a fallback structure
      parsedData["health pros and cons"] = {
        positive_things_about_the_product: [],
        harmful_things_about_the_product: [],
        alternatives_to_consider: []
      };
    }
  }
  
  return parsedData;
};

/**
 * Extract numeric value from a string (e.g. "150 calories" -> 150)
 * @param {string} nutrientString - String containing numeric value
 * @returns {number} - Extracted numeric value or 0 if none found
 */
export const getNutrientValue = (nutrientString) => {
  if (!nutrientString) return 0;
  
  // First try to match numbers with decimal points
  const decimalMatch = nutrientString.match(/\d+\.\d+/);
  if (decimalMatch) return parseFloat(decimalMatch[0]);
  
  // Then try integers
  const intMatch = nutrientString.match(/\d+/);
  return intMatch ? parseInt(intMatch[0], 10) : 0;
};

/**
 * Safely access nested object properties with a fallback value
 * @param {Object} obj - The object to access
 * @param {string} path - The path to the property (e.g., 'a.b.c')
 * @param {*} fallback - The fallback value if property doesn't exist
 * @returns {*} - The property value or fallback
 */
export const safeAccess = (obj, path, fallback = null) => {
  if (!obj || !path) return fallback;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return fallback;
    }
    result = result[key];
  }
  
  return result === undefined ? fallback : result;
};

/**
 * Capitalizes the first letter of a string
 * @param {string} string - Input string
 * @returns {string} - String with first letter capitalized
 */
export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Truncates a string to a maximum length, adding ellipsis if needed
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated string
 */
export const truncateString = (str, maxLength = 100) => {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

/**
 * Medical conditions list for dropdown
 */
export const diseases = [
  { id: 'none', name: 'No Medical Conditions' },
  { id: 'diabetes', name: 'Diabetes' },
  { id: 'hypertension', name: 'Hypertension' },
  { id: 'celiac', name: 'Celiac Disease' },
  { id: 'lactose', name: 'Lactose Intolerance' },
  { id: 'peanut', name: 'Peanut Allergy' },
  { id: 'shellfish', name: 'Shellfish Allergy' },
  { id: 'tree_nut', name: 'Tree Nut Allergy' },
  { id: 'gluten', name: 'Gluten Sensitivity' },
]; 