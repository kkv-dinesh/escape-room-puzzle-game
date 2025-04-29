from pydantic import BaseModel, EmailStr
from typing import List, Optional

class GameState(BaseModel):
    user_id: str 
    puzzle1_start_time: Optional[str] = None  
    puzzle1_end_time: Optional[str] = None  
    puzzle2_start_time: Optional[str] = None  
    puzzle2_end_time: Optional[str] = None   
    total_time: Optional[str] = None  

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
