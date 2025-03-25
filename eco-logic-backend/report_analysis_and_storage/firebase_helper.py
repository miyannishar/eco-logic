import firebase_admin
from firebase_admin import credentials, storage, db
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase with both storage bucket and database URL
cred = credentials.Certificate("firebase_config.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'gs://sustainify-91b96.firebasestorage.app',
    'databaseURL': 'https://sustainify-91b96-default-rtdb.firebaseio.com/'
})

bucket = storage.bucket()

def uploadFileToFireBase(file_content, content_type, destination_blob_name):
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_string(
        file_content,
        content_type=content_type
    )
    return blob.public_url

def retrieve_data_by_keyword(user_id):
    ref = db.reference(f'/users/{user_id}/reports')
    reports = ref.get()
    if not reports:
        return []
    
    report_contents = []
    for report in reports.values():
        if 'report_content' in report:
            report_contents.extend(report['report_content'])
    
    return report_contents 

def pushDataToRealtimeFBDB(user_id, report_data):
    """
    Push report data to Firebase Realtime Database under the user's ID
    """
    ref = db.reference(f'/users/{user_id}/reports')
    new_report_ref = ref.push()
    new_report_ref.set(report_data)
    return new_report_ref.key

def getUrlsOfUser(user_id):
    """
    Retrieve all report URLs associated with a specific user
    """
    ref = db.reference(f'/users/{user_id}/reports')
    reports = ref.get()
    
    if not reports:
        return []
    
    urls = []
    for report in reports.values():
        if 'url' in report:
            urls.append(report['url'])
    
    return urls