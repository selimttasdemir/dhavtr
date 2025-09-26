from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class LanguageCode(str, Enum):
    TR = "tr"
    EN = "en"
    DE = "de"
    RU = "ru"

class LegalAreaType(str, Enum):
    FAMILY_LAW = "family_law"
    COMMERCIAL_LAW = "commercial_law"
    CRIMINAL_LAW = "criminal_law"
    LABOR_LAW = "labor_law"
    REAL_ESTATE = "real_estate"
    CONTRACT_LAW = "contract_law"
    OTHER = "other"

class UrgencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Models
class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    subject: str
    legal_area: LegalAreaType
    urgency: UrgencyLevel
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_read: bool = False

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    phone: str
    subject: str
    legal_area: LegalAreaType
    urgency: UrgencyLevel
    message: str

class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title_tr: str
    title_en: str
    title_de: str
    title_ru: str
    content_tr: str
    content_en: str
    content_de: str
    content_ru: str
    slug: str
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPostCreate(BaseModel):
    title_tr: str
    title_en: str
    title_de: str
    title_ru: str
    content_tr: str
    content_en: str
    content_de: str
    content_ru: str
    slug: str
    published: bool = True

class SiteSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    logo_url: str = ""
    about_company: str = ""
    about_founder: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SiteSettingsUpdate(BaseModel):
    logo_url: str = ""
    about_company: str = ""
    about_founder: str = ""

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

# Helper functions
def prepare_for_mongo(data):
    """Prepare data for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    """Parse data from MongoDB"""
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, str) and 'T' in value and value.endswith('Z'):
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
    return item

# API Routes

# Contact Messages
@api_router.post("/messages", response_model=ContactMessage)
async def create_message(message_data: ContactMessageCreate):
    """Create a new contact message"""
    message_dict = message_data.dict()
    message_obj = ContactMessage(**message_dict)
    message_dict = prepare_for_mongo(message_obj.dict())
    await db.contact_messages.insert_one(message_dict)
    return message_obj

@api_router.get("/messages", response_model=List[ContactMessage])
async def get_messages():
    """Get all contact messages (admin only)"""
    messages = await db.contact_messages.find().sort("created_at", -1).to_list(length=None)
    return [ContactMessage(**parse_from_mongo(msg)) for msg in messages]

@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str):
    """Delete a contact message"""
    result = await db.contact_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted successfully"}

@api_router.put("/messages/{message_id}/read")
async def mark_message_read(message_id: str):
    """Mark message as read"""
    result = await db.contact_messages.update_one(
        {"id": message_id},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message marked as read"}

# Blog Posts
@api_router.post("/blog", response_model=BlogPost)
async def create_blog_post(post_data: BlogPostCreate):
    """Create a new blog post"""
    post_dict = post_data.dict()
    post_obj = BlogPost(**post_dict)
    post_dict = prepare_for_mongo(post_obj.dict())
    await db.blog_posts.insert_one(post_dict)
    return post_obj

@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts(published_only: bool = True):
    """Get blog posts"""
    query = {"published": True} if published_only else {}
    posts = await db.blog_posts.find(query).sort("created_at", -1).to_list(length=None)
    return [BlogPost(**parse_from_mongo(post)) for post in posts]

@api_router.get("/blog/{post_id}", response_model=BlogPost)
async def get_blog_post(post_id: str):
    """Get a specific blog post"""
    post = await db.blog_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return BlogPost(**parse_from_mongo(post))

@api_router.put("/blog/{post_id}", response_model=BlogPost)
async def update_blog_post(post_id: str, post_data: BlogPostCreate):
    """Update a blog post"""
    post_dict = post_data.dict()
    post_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.blog_posts.update_one(
        {"id": post_id},
        {"$set": post_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    updated_post = await db.blog_posts.find_one({"id": post_id})
    return BlogPost(**parse_from_mongo(updated_post))

@api_router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str):
    """Delete a blog post"""
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"message": "Blog post deleted successfully"}

# Admin routes
@api_router.get("/admin/check-setup")
async def check_admin_setup():
    """Check if admin user exists"""
    admin_count = await db.admin_users.count_documents({})
    return {"has_admin": admin_count > 0}

@api_router.delete("/admin/reset")
async def reset_admin():
    """Reset admin users - for development only"""
    await db.admin_users.delete_many({})
    return {"message": "Admin users reset successfully"}

class AdminSetupRequest(BaseModel):
    username: str
    password: str

class AdminLoginRequest(BaseModel):
    username: str
    password: str

@api_router.post("/admin/setup")
async def setup_admin(request: AdminSetupRequest):
    """Setup initial admin user"""
    # Check if admin already exists
    existing_admin = await db.admin_users.find_one({})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin user already exists")
    
    # Simple password hashing (in production, use proper bcrypt)
    import hashlib
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    
    admin_user = AdminUser(username=request.username, password_hash=password_hash)
    admin_dict = prepare_for_mongo(admin_user.dict())
    await db.admin_users.insert_one(admin_dict)
    
    return {"message": "Admin user created successfully"}

@api_router.post("/admin/login")
async def admin_login(request: AdminLoginRequest):
    """Admin login"""
    import hashlib
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    
    admin = await db.admin_users.find_one({
        "username": request.username,
        "password_hash": password_hash,
        "is_active": True
    })
    
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # In production, return JWT token
    return {"message": "Login successful", "admin_id": admin["id"]}

# Health check
@api_router.get("/")
async def root():
    return {"message": "Hançer Law Office API is running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()