from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Import CORSMiddleware
from routes.game_routes import router as game_router
from routes.auth_routes import router as auth_router
from database import init_db

app = FastAPI()

init_db()

origins = [
    "http://localhost:3000",  
    "https://yourfrontenddomain.com",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(game_router, prefix="/game")
app.include_router(auth_router, prefix="/auth")

@app.get("/")
def home():
    return {"message": "Escape Room Game API"}
