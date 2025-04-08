from pydantic import BaseModel, EmailStr
from typing import List, Optional

class GameState(BaseModel):
    user_id: str
    current_room: str
    visited_rooms: List[str]
    start_time: float  
    puzzle1_time: Optional[str] = None  
    puzzle2_time: Optional[str] = None  
    puzzle3_time: Optional[str] = None  
    total_time: Optional[str] = None  

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
