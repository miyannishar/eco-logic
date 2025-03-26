"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { getNutrientValue, capitalizeFirstLetter, safeAccess, truncateString } from '../utils';

/**
 * Component for displaying product analysis results
 * Memoized to prevent unnecessary re-renders
 */
const ProductAnalysisResult = ({ 
  prediction, 
  previewUrl, 
  fileType 
}) => {
  const [showRawData, setShowRawData] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle edge case where prediction is missing
  if (!prediction) return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
      <p className="text-gray-600 dark:text-gray-300">No analysis data available</p>
    </div>
  );

  // Memoize product info for performance
  const { 
    productName, 
    productDescription,
    environmentalData,
    healthData
  } = useMemo(() => {
    return {
      productName: prediction.product_name || "Analyzed Product",
      productDescription: prediction.product_description || "No description available",
      environmentalData: safeAccess(prediction, "enviromental pros and cons", {}),
      healthData: safeAccess(prediction, "health pros and cons", {})
    };
  }, [prediction]);

  return (
    <div className="mt-4 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        {/* Preview of analyzed image/video */}
        {previewUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Analyzed Media
            </h3>
            <div className="relative h-64 w-full mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {fileType === 'video' ? (
                <video
                  src={previewUrl}
                  className="object-contain w-full h-full"
                  controls
                  onError={() => setImageError(true)}
                />
              ) : (
                <>
                  {!imageError ? (
                    <Image
                      src={previewUrl}
                      alt="Analyzed image"
                      fill
                      className="object-contain"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-gray-500">Unable to display media</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Product Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {productName}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {truncateString(productDescription, 200)}
          </p>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Appearance - only show if available */}
            {prediction.product_appearance && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Product Appearance
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {prediction.product_appearance}
                </p>
              </div>
            )}

            {/* Ingredients - only show if available */}
            {safeAccess(prediction, 'ingridients_used', []).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ingredients
                </h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {prediction.ingridients_used.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nutritional Information - only show if available */}
            {safeAccess(prediction, 'nutritional_information', []).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nutritional Information
                </h3>
                <NutritionalData nutritionalInfo={prediction.nutritional_information} />
              </div>
            )}

            {/* Allergens & Warnings */}
            {(safeAccess(prediction, 'allergen_information', []).length > 0 || 
              safeAccess(prediction, 'cautions_and_warnings', []).length > 0) && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Allergens & Warnings
                </h4>
                <ul className="space-y-2">
                  {[
                    ...(prediction.allergen_information || []), 
                    ...(prediction.cautions_and_warnings || [])
                  ].map((warning, index) => (
                    <li key={index} className="flex items-center text-yellow-700 dark:text-yellow-300">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Environmental Impact */}
            {Object.keys(environmentalData).length > 0 && (
              <ImpactSection 
                title="Environmental Impact"
                data={environmentalData}
                positiveTitle="Positives"
                negativeTitle="Concerns"
                alternativesTitle="Eco-Friendly Alternatives"
                positiveColor="green"
                negativeColor="red"
                alternativeColor="blue"
              />
            )}

            {/* Health Impact - only show if available */}
            {Object.keys(healthData).length > 0 && (
              <ImpactSection 
                title="Health Considerations"
                data={healthData}
                positiveTitle="Benefits"
                negativeTitle="Risks"
                alternativesTitle="Healthier Alternatives"
                positiveColor="green"
                negativeColor="red"
                alternativeColor="blue"
              />
            )}
          </div>
        </div>

        {/* View Raw Data Button */}
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 
            dark:hover:text-gray-300 underline"
        >
          {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
        </button>
        {showRawData && (
          <pre
            className="mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto 
              max-h-96 text-sm whitespace-pre-wrap"
          >
            {JSON.stringify(prediction, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

/**
 * Extracted component for nutritional data display
 */
const NutritionalData = ({ nutritionalInfo }) => {
  if (!nutritionalInfo || !nutritionalInfo.length) return null;
  
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calories - with null check */}
        {nutritionalInfo.length > 1 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Calories</span>
              <span className="font-semibold">{getNutrientValue(nutritionalInfo[1])}cal</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((getNutrientValue(nutritionalInfo[1]) / 2000) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">% Daily Value based on 2000 cal diet</span>
          </div>
        )}

        {/* Carbohydrates - with null check */}
        {nutritionalInfo.length > 4 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Carbohydrates</span>
              <span className="font-semibold">{getNutrientValue(nutritionalInfo[4])}g</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((getNutrientValue(nutritionalInfo[4]) / 300) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">% Daily Value based on 300g recommendation</span>
          </div>
        )}

        {/* Other Nutrients Grid - with null checks */}
        <div className="grid grid-cols-2 gap-4">
          {nutritionalInfo.length > 6 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Protein</span>
              <p className="font-semibold">{getNutrientValue(nutritionalInfo[6])}g</p>
            </div>
          )}
          {nutritionalInfo.length > 2 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Fat</span>
              <p className="font-semibold">{getNutrientValue(nutritionalInfo[2])}g</p>
            </div>
          )}
          {nutritionalInfo.length > 3 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sodium</span>
              <p className="font-semibold">{getNutrientValue(nutritionalInfo[3])}mg</p>
            </div>
          )}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Serving</span>
            <p className="font-semibold">355ml</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable component for displaying impact data (environmental or health)
 */
const ImpactSection = ({ 
  title, 
  data, 
  positiveTitle, 
  negativeTitle, 
  alternativesTitle,
  positiveColor = "green",
  negativeColor = "red",
  alternativeColor = "blue"
}) => {
  const positives = safeAccess(data, 'positive_things_about_the_product', []);
  const negatives = safeAccess(data, 'harmful_things_about_the_product', []);
  const alternatives = safeAccess(data, 'alternatives_to_consider', []);
  
  if (!positives.length && !negatives.length && !alternatives.length) return null;
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <div className="space-y-4">
        {/* Pros */}
        {positives.length > 0 && (
          <div>
            <h4 className={`text-${positiveColor}-600 dark:text-${positiveColor}-400 font-medium mb-2`}>
              {positiveTitle}
            </h4>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              {positives.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Cons */}
        {negatives.length > 0 && (
          <div>
            <h4 className={`text-${negativeColor}-600 dark:text-${negativeColor}-400 font-medium mb-2`}>
              {negativeTitle}
            </h4>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              {negatives.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div>
            <h4 className={`text-${alternativeColor}-600 dark:text-${alternativeColor}-400 font-medium mb-2`}>
              {alternativesTitle}
            </h4>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              {alternatives.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Export as memoized component to prevent unnecessary re-renders
export default ProductAnalysisResult; 