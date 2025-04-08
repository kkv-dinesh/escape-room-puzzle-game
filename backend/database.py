from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

mongo_url = os.getenv("MONGO_URL")

client = MongoClient(mongo_url)
db = client["escape_room"]
game_sessions = db["game_sessions"]
rooms_collection = db["rooms"]
users_collection = db["users"]
game_collection = db["game_data"]

def init_db():
    if rooms_collection.count_documents({}) == 0:
        rooms_collection.insert_many([
            {"id": "room1", "name": "Room 1", "difficulty": 1, "locked": False, "maze": [], "items": ["key1"]},
            {"id": "room2", "name": "Room 2", "difficulty": 2, "locked": True, "key_required": "key1", "maze": [], "items": ["key2"]},
            {"id": "room3", "name": "Room 3", "difficulty": 3, "locked": True, "key_required": "key2", "maze": [], "items": []}
        ])

def get_db():
    return db