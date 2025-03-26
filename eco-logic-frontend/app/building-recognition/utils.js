/**
 * Utility functions for the Food Analysis feature
 */

/**
 * Parses response data to handle stringified JSON fields
 * @param {Object} data - API response data object
 * @returns {Object} - Data with parsed JSON strings
 */
export const parseResponseData = (data) => {
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
    }
  }
  
  // Parse health pros and cons
  if (parsedData["health pros and cons"] && typeof parsedData["health pros and cons"] === 'string') {
    try {
      parsedData["health pros and cons"] = JSON.parse(parsedData["health pros and cons"]);
    } catch (e) {
      console.error("Error parsing health pros and cons:", e);
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
  const value = nutrientString.match(/\d+/);
  return value ? parseInt(value[0]) : 0;
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
]; 