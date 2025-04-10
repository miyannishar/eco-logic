# Eco-Logic Backend

The AI-powered backend for the Eco-Logic sustainability platform.

## Overview

This FastAPI application provides AI-powered analysis of products and medical reports using Google's Gemini AI. It interfaces with MongoDB for data storage and provides RESTful API endpoints for the Eco-Logic frontend.

## Setup & Development

### Prerequisites

- Python 3.9+
- MongoDB Atlas account
- Google Gemini API key

### Local Development

1. Clone the repository
2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Create a `.env` file with your configuration:
   ```
   # AI Configuration
   GEMINI_API_KEY=your_gemini_api_key

   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string

   # API Configuration
   BACKEND_URL=http://localhost:8000
   ```
5. Run the development server:
   ```
   uvicorn main:app --reload
   ```
6. Access the API documentation at http://localhost:8000/docs

## Deploying to Render

### Setup

1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: eco-logic-backend (or your preferred name)
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables

Add the following environment variables in the Render dashboard:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `MONGODB_URI`: Your MongoDB connection string
- `BACKEND_URL`: The URL of your deployed backend (e.g., `https://eco-logic-backend.onrender.com`)

### Scaling

If needed, you can adjust the instance type in Render for better performance.

## API Endpoints

### Product Analysis

- `POST /eco-agent/product-details`: Analyze a product image and get environmental and health insights

### Medical Reports

- `POST /report-storage/analyse-and-upload`: Upload and analyze a medical report
- `POST /report-storage/fetch-user-reports-url`: Get all reports for a specific user
- `GET /report-storage/files/{file_id}`: View a file from MongoDB
- `GET /report-storage/download/{file_id}/{filename}`: Download a file with a friendly filename

## Architecture

The application uses:
- **FastAPI**: For the web server and API endpoints
- **Google Gemini AI**: For AI-powered analysis
- **MongoDB**: For data and file storage (including GridFS for files)
- **Tavily API**: For real-time web search capabilities

## Troubleshooting

If you encounter issues with file access or storage, check:
1. Your MongoDB connection string is correct
2. The BACKEND_URL variable is set correctly
3. All required environment variables are set
4. The application has permission to create temporary files
