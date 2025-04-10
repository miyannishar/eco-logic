from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Create required directories for file operations
os.makedirs('media/videos', exist_ok=True)
os.makedirs('media/reports', exist_ok=True)
os.makedirs('media/reports/temp_downloads', exist_ok=True)

# router
from report_analysis_and_storage import report_analysis
from eco_agent import eco_agent

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://10.0.0.201:3000",
    "http://10.0.0.201:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://10.0.0.201",
    "http://localhost",
    "http://10.0.0.201:3000",
    # Add your frontend URL when deployed
    "https://eco-logic-frontend.onrender.com",
    "https://eco-logic-frontend.vercel.app"
]

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use specific origins instead of ["*"]
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"],
    max_age=3600,
)

# including routers
app.include_router(report_analysis.router)
app.include_router(eco_agent.router)

# Add this block to run the server without uvloop
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, loop="asyncio")