import os
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
import gridfs

load_dotenv()

# MongoDB Connection String
MONGO_URI = "mongodb+srv://miyannishar:qt0MWsFulJuOay9A@cluster0.6i7hzoj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

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
        'url': f"/api/files/{file_id}",  # This could be used with a new endpoint to fetch files
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
    reports_collection = db['reports']
    reports = list(reports_collection.find({'user-id': user_id}))
    
    if not reports:
        return []
    
    urls = []
    for report in reports:
        if 'file_url' in report:
            urls.append(report['file_url'])
    
    return urls 