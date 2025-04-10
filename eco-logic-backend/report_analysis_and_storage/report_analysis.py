from fastapi import APIRouter, Depends, status, HTTPException, Body, File, UploadFile
import os
import json
from fastapi.responses import StreamingResponse, FileResponse, RedirectResponse
import io
import tempfile
from typing import Optional
from fastapi import Query
from starlette.background import BackgroundTask

# Replace Firebase imports with MongoDB imports
from .mongodb_helper import upload_file_to_mongodb, store_report_data, get_urls_of_user, retrieve_data_by_keyword, BACKEND_URL

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
    """Analyze and upload a medical report"""
    file_path = None
    try:
        # Make sure we have a valid user ID
        if not userId:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="User ID is required")
        user_id = userId
        
        # Read the file
        file_binary_content = await fileInput.read()
        file_type = fileInput.content_type
        file_size = len(file_binary_content)
        
        # Determine file extension
        file_extension = fileInput.filename.split('.')[-1] if '.' in fileInput.filename else ''
        
        # Check if file type is supported by Gemini
        supported_formats = ['pdf', 'jpg', 'jpeg', 'png']
        if file_extension.lower() not in supported_formats:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, 
                               detail=f"File format .{file_extension} is not supported. Supported formats: {', '.join(supported_formats)}")

        # Create a temporary file for Gemini
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
            temp_file.write(file_binary_content)
            file_path = temp_file.name
            
        print(f"Created temporary file at: {file_path}")

        # Load to Gemini storage for generation and get response
        response = typeDocInputNOutputFormat(model, extract_details_from_report, ReportContent, file_path)
        
        # Check if response is valid
        if isinstance(response, dict) and "error" in response:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, 
                               detail=f"Failed to analyze the document: {response['error']}")
        
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

        # Upload file to MongoDB GridFS
        file_result = upload_file_to_mongodb(
            file_binary_content,
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

        # Add download URL to the response - use absolute URL
        final_data_push['download_url'] = f"{BACKEND_URL}/report-storage/download/{file_result['file_id']}/{unique_filename}"
        
        # Make sure view_url is also an absolute URL
        final_data_push['view_url'] = file_result['url']  # This should already be absolute from the helper function

        # Clean up the temporary file
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            print(f"Temporary file removed: {file_path}")

        # Return the response
        return final_data_push

    except Exception as e:
        # Clean up the temporary file if it exists
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            print(f"Temporary file removed after error: {file_path}")
            
        # Re-enable exception handling
        import traceback
        print(f"Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error processing file: {str(e)}")


@router.post('/fetch-user-reports-url')
@router.get('/fetch-user-reports-url')  # Adding GET support for easier testing
def fetchUrlsOfUserReportsAndTypes(userId: str = None, user_id: str = None):
    """
    Get all reports for a specific user.
    Can be called with either 'userId' or 'user_id' parameter.
    """
    try:
        # Use whichever parameter is provided
        actual_user_id = userId or user_id
        
        if not actual_user_id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, 
                               detail="User ID is required. Provide either 'userId' or 'user_id' parameter.")
        
        print(f"Fetching reports for user ID: {actual_user_id}")
        reports = get_urls_of_user(actual_user_id)
        
        # Add a message if no reports are found
        if not reports:
            return {
                "message": f"No reports found for user ID: {actual_user_id}",
                "reports": []
            }
        
        # Verify all URLs are absolute
        for report in reports:
            # Ensure URL is absolute (should already be handled in mongodb_helper)
            if 'url' in report and not report['url'].startswith('http'):
                report['url'] = f"{BACKEND_URL}{report['url']}"
            if 'download_url' in report and not report['download_url'].startswith('http'):
                report['download_url'] = f"{BACKEND_URL}{report['download_url']}"
            
        return {
            "message": f"Found {len(reports)} reports",
            "reports": reports
        }
    except Exception as e:
        print(f"Error fetching user reports: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Error retrieving user reports: {str(e)}")


# New endpoint to serve files from MongoDB GridFS
@router.get('/files/{file_id}')
def get_file_endpoint(file_id: str):
    from .mongodb_helper import get_file
    
    file = get_file(file_id)
    if not file:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found")
    
    # Return the file as a streaming response
    content_type = file.content_type
    file_data = file.read()
    
    # Set headers to allow cross-origin access
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Disposition": "inline"
    }
    
    return StreamingResponse(
        io.BytesIO(file_data),
        media_type=content_type,
        headers=headers
    )

# New dedicated download endpoint with filename
@router.get('/download/{file_id}/{filename}')
def download_file(file_id: str, filename: str):
    """
    Download a file with a proper filename, making it more user-friendly.
    This endpoint serves the file as an attachment with the specified filename.
    """
    from .mongodb_helper import get_file
    
    file = get_file(file_id)
    if not file:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found")
    
    # Read the file data
    file_data = file.read()
    content_type = file.content_type
    
    # Create a temporary file to serve as a download
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as temp_file:
        temp_file.write(file_data)
        temp_path = temp_file.name
    
    print(f"Created temporary download file at: {temp_path}")
    
    # Set headers to allow cross-origin access
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Disposition": f"attachment; filename={filename}"
    }
    
    # Use FileResponse with cleanup callback
    return FileResponse(
        path=temp_path,
        filename=filename,
        media_type=content_type,
        headers=headers,
        background=BackgroundTask(lambda: os.remove(temp_path) if os.path.exists(temp_path) else None)
    )




# @router.post('/just-upload')
# def justUpload():
#     return