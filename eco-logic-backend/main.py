from fastapi import FastAPI

# router
from eco_agent import eco_agent

app = FastAPI()

# including routers
app.include_router(eco_agent.router)