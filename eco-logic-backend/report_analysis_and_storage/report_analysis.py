from fastapi import APIRouter, Depends, status, HTTPException, Body, File, UploadFile
import os
import json

# Replace Firebase imports with MongoDB imports
from .mongodb_helper import upload_file_to_mongodb, store_report_data, get_urls_of_user, retrieve_data_by_keyword

from .prompts import extract_details_from_report

from wrapper import typeDocInputNOutputFormat, model

from .output_strucutre import ReportContent

from generate_random_id import generate_unique_code


router = APIRouter(
    prefix="/report-storage",
    tags=['Report-Analysis and Storage']
)


@router.get('/test')
def testRouter():
    return {"success": "Work's Like a Charm"}

@router.post('/analyse-and-upload')
async def analyseAndUploadReport(userId: str, fileInput: UploadFile = File(...)):
    file_path = None
    try:
        # process inputs
        user_id = userId
        file_binary_content = await fileInput.read()
        file_type = fileInput.content_type
        
        # Check if file has an extension
        if '.' in fileInput.filename:
            _, file_extension = fileInput.filename.split('.')
        else:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, 
                               detail=f"File must have an extension. Supported formats: pdf, jpg, png, jpeg.")
        
        # Check if file type is supported by Gemini
        supported_formats = ['pdf', 'jpg', 'jpeg', 'png']
        if file_extension.lower() not in supported_formats:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, 
                               detail=f"File format .{file_extension} is not supported. Supported formats: {', '.join(supported_formats)}")

        # store the file temp to give gemini input
        file_path = os.path.join('media', 'reports', f'temp.{file_extension}')

        # Ensure the directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        with open(file_path, 'wb') as jammer:
            jammer.write(file_binary_content)

        # load to gemini storage for generation and get response about the pdf and type
        response = typeDocInputNOutputFormat(model, extract_details_from_report, ReportContent, file_path)
        
        # Check if response is valid (not False or None)
        if not response or isinstance(response, bool):
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, 
                               detail="Failed to analyze the document. The AI model could not process this file.")
        
        # Parse the response if it's a string (JSON)
        if isinstance(response, str):
            try:
                print(f"Parsing string response: {response}")
                response = json.loads(response)
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON response: {e}")
                raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                  detail=f"Failed to parse AI response: {str(e)}")

        # Get report type from AI response
        report_categorized_type = response['report_type']

        # Generate a unique filename for MongoDB
        unique_filename = f"{userId}_{report_categorized_type}_{generate_unique_code()}.{file_extension}"

        # Upload file to MongoDB GridFS instead of Firebase Storage
        with open(file_path, 'rb') as jammer:
            file_result = upload_file_to_mongodb(
                jammer.read(),
                file_type,
                unique_filename,
                metadata={
                    'user_id': user_id,
                    'report_type': report_categorized_type
                }
            )

        # Create a data structure for MongoDB
        final_data_push = {
            'user-id': user_id,
            'report-category': report_categorized_type,
            'file-id': file_result['file_id'],
            'file_url': file_result['url'],
            'filename': unique_filename,
            'report-content': response['report_content']
        }

        # Store the report data in MongoDB
        document_id = store_report_data(final_data_push)
        final_data_push['_id'] = document_id

        # Clean up the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)

        # Return the response
        return final_data_push

    except Exception as e:
        # Clean up the temporary file if it exists
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            
        # Re-enable exception handling
        import traceback
        print(f"Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error processing file: {str(e)}")


@router.post('/fetch-user-reports-url')
def fetchUrlsOfUserReportsAndTypes(usedId: str):
    try:
        return get_urls_of_user(usedId)
    except Exception as e:
        print(f"Error fetching user reports: {str(e)}")
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"User not Found: {str(e)}")


# New endpoint to serve files from MongoDB GridFS
@router.get('/files/{file_id}')
def get_file_endpoint(file_id: str):
    from .mongodb_helper import get_file
    from fastapi.responses import StreamingResponse
    import io
    
    file = get_file(file_id)
    if not file:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found")
    
    # Return the file as a streaming response
    content_type = file.content_type
    file_data = file.read()
    
    return StreamingResponse(
        io.BytesIO(file_data),
        media_type=content_type
    )




# @router.post('/just-upload')
# def justUpload():
#     return