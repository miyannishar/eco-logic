import os
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
import gridfs

load_dotenv()

# MongoDB Connection String
MONGO_URI = os.environ.get('MONGO_URI', "mongodb+srv://miyannishar:qt0MWsFulJuOay9A@cluster0.6i7hzoj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

# Base URL for backend API - should be set in environment variables
# This should be the full URL to your backend API including protocol, domain, and port
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client['eco-logic']  # Database name
fs = gridfs.GridFS(db)    # GridFS for file storage

def upload_file_to_mongodb(file_content, content_type, filename, metadata=None):
    """Upload a file to MongoDB GridFS (replaces Firebase Storage)"""
    file_id = fs.put(
        file_content,
        content_type=content_type,
        filename=filename,
        metadata=metadata or {}
    )
    
    # Return the file ID and a URL-like identifier that can be used in your application
    return {
        'file_id': str(file_id),
        'url': f"{BACKEND_URL}/report-storage/files/{file_id}",  # Use absolute URL
    }

def get_file(file_id):
    """Retrieve a file from MongoDB GridFS"""
    try:
        return fs.get(ObjectId(file_id))
    except Exception as e:
        print(f"Error retrieving file {file_id}: {str(e)}")
        return None

def store_report_data(data):
    """Store report data in MongoDB (replaces Firebase Realtime DB)"""
    reports_collection = db['reports']
    result = reports_collection.insert_one(data)
    return str(result.inserted_id)

def retrieve_data_by_keyword(user_id):
    """Get all report content for a specific user (replacement for Firebase retrieve_data_by_keyword)"""
    reports_collection = db['reports']
    reports = reports_collection.find({'user-id': user_id})
    
    report_contents = []
    for report in reports:
        if 'report-content' in report:
            report_contents.extend(report['report-content'])
    
    return report_contents

def get_urls_of_user(user_id):
    """Get file URLs associated with a user (replacement for Firebase getUrlsOfUser)"""
    print(f"Searching for reports with user ID: {user_id}")
    reports_collection = db['reports']
    
    # Try both formats of user ID (with and without hyphen)
    # This helps if there's inconsistency in how the IDs are stored
    query = {"$or": [
        {'user-id': user_id},
        {'userId': user_id}
    ]}
    
    try:
        reports = list(reports_collection.find(query))
        print(f"Found {len(reports)} reports in MongoDB")
        
        if not reports:
            # If no reports found, count total documents for debugging
            total_docs = reports_collection.count_documents({})
            print(f"No reports found for this user ID. Total documents in collection: {total_docs}")
            # List some recent documents to help diagnose
            some_docs = list(reports_collection.find().limit(3))
            if some_docs:
                print(f"Sample document keys: {list(some_docs[0].keys())}")
            return []
        
        urls = []
        for report in reports:
            print(f"Processing report: {report.get('filename', 'unknown')}")
            if 'file_url' in report:
                # Extract file ID from the URL path
                file_url = report['file_url']
                
                # Create proper absolute download URL
                # If URL is relative, convert to absolute
                if file_url.startswith('/'):
                    view_url = f"{BACKEND_URL}{file_url}"
                else:
                    view_url = file_url
                
                # Generate a more user-friendly download link with the filename
                report_name = report.get('filename', 'report.pdf')
                report_type = report.get('report-category', 'Unknown')
                file_id = report.get('file-id', '')
                
                # Always use absolute URLs for download links
                download_url = f"{BACKEND_URL}/report-storage/download/{file_id}/{report_name}"
                
                urls.append({
                    'url': view_url,
                    'download_url': download_url,
                    'report_type': report_type,
                    'filename': report_name,
                    'file_id': file_id
                })
            else:
                print(f"Report missing file_url key. Available keys: {list(report.keys())}")
        
        return urls
    except Exception as e:
        print(f"Error in get_urls_of_user: {str(e)}")
        return [] 