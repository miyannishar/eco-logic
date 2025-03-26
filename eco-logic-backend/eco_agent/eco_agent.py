from fastapi import APIRouter, Depends, status, HTTPException, Body, UploadFile, File
from fastapi.responses import JSONResponse
from typing import List
import os
import json

from wrapper import getOutPutInFormat, tavilySearch, model_pro, model, typeDocInputNOutputFormat
from .output_structure import EdibleDataExtraction, EnviromentalProsAndCons, HealthProsAndCons
from .prompts import product_description_template, web_searching_template, enviromental_suggestions
from report_analysis_and_storage import firebase_helper

router = APIRouter(
    prefix="/eco-agent",
    tags=['Eco-Friendly Suggestions']
)

@router.get('/test')
def testRouter():
    return {"Prenatal - API Router Test": "Works like a Charm!!!"}

@router.post('/product-details')
async def describeProducts(userMedicalAilments: str, file: UploadFile = File(...)):
    try:
        print("\n=== Starting Product Description Process ===")
        print(f"Received file: {file.filename}")
        print(f"User medical ailments: {userMedicalAilments}")
        
        # Save the uploaded file
        file_content = await file.read()
        video_path = os.path.join('media', 'videos', file.filename)
        with open(video_path, 'wb') as buffer:
            buffer.write(file_content)
        print(f"Saved file to: {video_path}")

        try:
            print("\n--- Getting initial product details from image ---")
            # Get initial product details from image
            product_details = typeDocInputNOutputFormat(
                model, 
                product_description_template, 
                EdibleDataExtraction, 
                video_path
            )
            print(f"Raw product details response: {product_details}")

            if isinstance(product_details, dict) and "error" in product_details:
                print("Error in product details:", product_details)
                return JSONResponse(
                    status_code=500,
                    content=product_details
                )

            # Parse the JSON string into a dictionary
            try:
                if isinstance(product_details, str):
                    print("Parsing product details JSON string")
                    product_details = json.loads(product_details)
                print("Parsed product details:", json.dumps(product_details, indent=2))
            except json.JSONDecodeError as e:
                print(f"Failed to parse product details: {str(e)}")
                print(f"Raw content that failed to parse: {product_details}")
                return JSONResponse(
                    status_code=500,
                    content={"error": "Failed to parse product details"}
                )

            print("\n--- Generating search queries ---")
            # Generate search queries
            rendered_template = web_searching_template.render(
                product_name=product_details["product_name"],
                product_appereance=product_details["product_appearance"],
                product_description=product_details["product_description"],
                manufacturing_location=product_details["manufacturing_location"],
                ingridients_used=product_details["ingridients_used"],
            )
            print("Rendered template for search queries:", rendered_template)
            
            search_queries = getOutPutInFormat(
                model,
                rendered_template,
                [],
                List[str]
            )
            print(f"Raw search queries response: {search_queries}")

            if search_queries is False:
                print("Failed to generate search queries")
                return JSONResponse(
                    status_code=500,
                    content={"error": "Failed to generate search queries"}
                )

            # Parse the search queries if it's a string
            try:
                if isinstance(search_queries, str):
                    print("Attempting to parse search queries")
                    # Try to parse as JSON first
                    try:
                        search_queries = json.loads(search_queries)
                        print("Successfully parsed search queries as JSON")
                    except json.JSONDecodeError:
                        print("Failed to parse as JSON, falling back to line splitting")
                        # If not valid JSON, split by newlines and clean up
                        search_queries = [q.strip() for q in search_queries.split('\n') if q.strip()]
                print("Final search queries:", search_queries)
            except Exception as e:
                print(f"Error parsing search queries: {str(e)}")
                return JSONResponse(
                    status_code=500,
                    content={"error": f"Failed to parse search queries: {str(e)}"}
                )

            # Ensure search_queries is a list and not empty
            if not isinstance(search_queries, list) or not search_queries:
                print(f"Invalid search queries format. Type: {type(search_queries)}, Value: {search_queries}")
                return JSONResponse(
                    status_code=500,
                    content={"error": "Invalid or empty search queries format"}
                )

            print("\n--- Gathering context from web search ---")
            # Gather context from web search
            context = []
            for query in search_queries:
                print(f"Searching web for: {query}")
                search_results = tavilySearch(query)
                if search_results:
                    context.extend(search_results)
                    print(f"Found {len(search_results)} results")
                else:
                    print("No results found for query")

            context = '\n\n'.join(context)
            print(f"Total context length: {len(context)} characters")

            print("\n--- Generating environmental analysis ---")
            # Generate environmental analysis
            pros_and_cons_enviromental = getOutPutInFormat(
                model,
                enviromental_suggestions.render(
                    product_name=product_details["product_name"],
                    product_appereance=product_details["product_appearance"],
                    product_description=product_details["product_description"],
                    manufacturing_location=product_details["manufacturing_location"],
                    ingridients_used=product_details["ingridients_used"],
                    web_scraped_info=context
                ),
                [],
                EnviromentalProsAndCons
            )
            print("Environmental analysis response:", pros_and_cons_enviromental)

            # Generate health analysis
            pros_and_cons_health = getOutPutInFormat(
                model,
                enviromental_suggestions.render(
                    product_name=product_details["product_name"],
                    product_description=product_details["product_description"],
                    ingridients_used=product_details["ingridients_used"],
                    allergen_information=product_details["allergen_information"],
                    cautions_and_warnings=product_details["cautions_and_warnings"],
                    user_medical_ailments=userMedicalAilments,
                    user_medical_report_details='\n\n'.join(firebase_helper.retrieve_data_by_keyword('Om123'))
                ),
                [],
                HealthProsAndCons
            )

            # Combine all results
            product_details['enviromental pros and cons'] = pros_and_cons_enviromental
            product_details['health pros and cons'] = pros_and_cons_health

            return JSONResponse(
                status_code=200,
                content=product_details
            )

        except Exception as e:
            import traceback
            print("Processing Error:", str(e))
            print("Traceback:", traceback.format_exc())
            return JSONResponse(
                status_code=500,
                content={
                    "error": str(e),
                    "status": "failed",
                    "step": "processing"
                }
            )

    except Exception as e:
        import traceback
        print("File Handling Error:", str(e))
        print("Traceback:", traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                "error": str(e),
                "status": "failed",
                "step": "file_handling"
            }
        )
    finally:
        # Clean up the temporary file
        if os.path.exists(video_path):
            os.remove(video_path) 