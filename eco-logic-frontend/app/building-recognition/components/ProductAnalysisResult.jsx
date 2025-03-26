"use client";

import { useState } from 'react';
import Image from 'next/image';
import { getNutrientValue, capitalizeFirstLetter } from '../utils';

/**
 * Component for displaying product analysis results
 */
export default function ProductAnalysisResult({ 
  prediction, 
  previewUrl, 
  fileType 
}) {
  const [showRawData, setShowRawData] = useState(false);

  if (!prediction) return null;

  // Default product name and description if not provided
  const productName = prediction.product_name || "Analyzed Product";
  const productDescription = prediction.product_description || "No description available";

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
                />
              ) : (
                <Image
                  src={previewUrl}
                  alt="Analyzed image"
                  fill
                  className="object-contain"
                />
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
            {productDescription}
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
            {prediction.ingridients_used && prediction.ingridients_used.length > 0 && (
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
            {prediction.nutritional_information && prediction.nutritional_information.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nutritional Information
                </h3>
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Calories - with null check */}
                    {prediction.nutritional_information && prediction.nutritional_information.length > 1 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Calories</span>
                          <span className="font-semibold">{getNutrientValue(prediction.nutritional_information[1])}cal</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${(getNutrientValue(prediction.nutritional_information[1]) / 2000) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">% Daily Value based on 2000 cal diet</span>
                      </div>
                    )}

                    {/* Carbohydrates - with null check */}
                    {prediction.nutritional_information && prediction.nutritional_information.length > 4 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Carbohydrates</span>
                          <span className="font-semibold">{getNutrientValue(prediction.nutritional_information[4])}g</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${(getNutrientValue(prediction.nutritional_information[4]) / 300) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">% Daily Value based on 300g recommendation</span>
                      </div>
                    )}

                    {/* Sugars - with null check */}
                    {prediction.nutritional_information && prediction.nutritional_information.length > 5 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Sugars</span>
                          <span className="font-semibold">{getNutrientValue(prediction.nutritional_information[5])}g</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${(getNutrientValue(prediction.nutritional_information[5]) / 50) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">% Daily Value based on 50g recommendation</span>
                      </div>
                    )}

                    {/* Other Nutrients Grid - with null checks */}
                    <div className="grid grid-cols-2 gap-4">
                      {prediction.nutritional_information && prediction.nutritional_information.length > 6 && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Protein</span>
                          <p className="font-semibold">{getNutrientValue(prediction.nutritional_information[6])}g</p>
                        </div>
                      )}
                      {prediction.nutritional_information && prediction.nutritional_information.length > 2 && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Fat</span>
                          <p className="font-semibold">{getNutrientValue(prediction.nutritional_information[2])}g</p>
                        </div>
                      )}
                      {prediction.nutritional_information && prediction.nutritional_information.length > 3 && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Sodium</span>
                          <p className="font-semibold">{getNutrientValue(prediction.nutritional_information[3])}mg</p>
                        </div>
                      )}
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Serving</span>
                        <p className="font-semibold">355ml</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Allergens & Warnings */}
            {((prediction.allergen_information && prediction.allergen_information.length > 0) || 
              (prediction.cautions_and_warnings && prediction.cautions_and_warnings.length > 0)) && (
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
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Environmental Impact */}
            {prediction["enviromental pros and cons"] && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Environmental Impact
                </h3>
                <div className="space-y-4">
                  {/* Pros */}
                  {prediction["enviromental pros and cons"].positive_things_about_the_product && 
                    prediction["enviromental pros and cons"].positive_things_about_the_product.length > 0 && (
                    <div>
                      <h4 className="text-green-600 dark:text-green-400 font-medium mb-2">Positives</h4>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                        {prediction["enviromental pros and cons"].positive_things_about_the_product.map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Cons */}
                  {prediction["enviromental pros and cons"].harmful_things_about_the_product && 
                    prediction["enviromental pros and cons"].harmful_things_about_the_product.length > 0 && (
                    <div>
                      <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">Concerns</h4>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                        {prediction["enviromental pros and cons"].harmful_things_about_the_product.map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Environmental Alternatives */}
                  {prediction["enviromental pros and cons"].alternatives_to_consider && 
                    prediction["enviromental pros and cons"].alternatives_to_consider.length > 0 && (
                    <div>
                      <h4 className="text-blue-600 dark:text-blue-400 font-medium mb-2">Eco-Friendly Alternatives</h4>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                        {prediction["enviromental pros and cons"].alternatives_to_consider.map((alternative, index) => (
                          <li key={index}>{alternative}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Health Impact - only show if available */}
            {prediction["health pros and cons"] && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Health Considerations
                </h3>
                <div className="space-y-4">
                  {/* Pros */}
                  {prediction["health pros and cons"].positive_things_about_the_product && 
                    prediction["health pros and cons"].positive_things_about_the_product.length > 0 && (
                    <div>
                      <h4 className="text-green-600 dark:text-green-400 font-medium mb-2">Benefits</h4>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                        {prediction["health pros and cons"].positive_things_about_the_product.map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Cons */}
                  {prediction["health pros and cons"].harmful_things_about_the_product && 
                    prediction["health pros and cons"].harmful_things_about_the_product.length > 0 && (
                    <div>
                      <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">Risks</h4>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                        {prediction["health pros and cons"].harmful_things_about_the_product.map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Health Alternatives */}
                  {prediction["health pros and cons"].alternatives_to_consider && 
                    prediction["health pros and cons"].alternatives_to_consider.length > 0 && (
                    <div>
                      <h4 className="text-blue-600 dark:text-blue-400 font-medium mb-2">Healthier Alternatives</h4>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                        {prediction["health pros and cons"].alternatives_to_consider.map((alternative, index) => (
                          <li key={index}>{alternative}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Raw Data Button */}
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 
            dark:hover:text-gray-300 underline"
        >
          Toggle Raw Data
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
} 