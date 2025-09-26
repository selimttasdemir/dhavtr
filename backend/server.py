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
from datetime import datetime, timezone, timedelta
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
    # Hero section
    hero_title_tr: str = ""
    hero_title_en: str = ""
    hero_title_de: str = ""
    hero_title_ru: str = ""
    hero_subtitle_tr: str = ""
    hero_subtitle_en: str = ""
    hero_subtitle_de: str = ""
    hero_subtitle_ru: str = ""
    hero_description_tr: str = ""
    hero_description_en: str = ""
    hero_description_de: str = ""
    hero_description_ru: str = ""
    # About section
    about_company_tr: str = ""
    about_company_en: str = ""
    about_company_de: str = ""
    about_company_ru: str = ""
    about_founder_tr: str = ""
    about_founder_en: str = ""
    about_founder_de: str = ""
    about_founder_ru: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SiteSettingsUpdate(BaseModel):
    logo_url: str = ""
    # Hero section
    hero_title_tr: str = ""
    hero_title_en: str = ""
    hero_title_de: str = ""
    hero_title_ru: str = ""
    hero_subtitle_tr: str = ""
    hero_subtitle_en: str = ""
    hero_subtitle_de: str = ""
    hero_subtitle_ru: str = ""
    hero_description_tr: str = ""
    hero_description_en: str = ""
    hero_description_de: str = ""
    hero_description_ru: str = ""
    # About section
    about_company_tr: str = ""
    about_company_en: str = ""
    about_company_de: str = ""
    about_company_ru: str = ""
    about_founder_tr: str = ""
    about_founder_en: str = ""
    about_founder_de: str = ""
    about_founder_ru: str = ""

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class PasswordResetRequest(BaseModel):
    email: str

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

# Site Settings
@api_router.get("/settings", response_model=SiteSettings)
async def get_site_settings():
    """Get site settings"""
    settings = await db.site_settings.find_one({})
    if not settings:
        # Create default settings if none exist
        default_settings = SiteSettings(
            logo_url="https://via.placeholder.com/200x60/1e3a8a/ffffff?text=DH+HUKUK",
            hero_title_tr="Av. Deniz Hançer",
            hero_title_en="Atty. Deniz Hançer", 
            hero_title_de="RA Deniz Hançer",
            hero_title_ru="Адв. Дениз Ханчер",
            hero_subtitle_tr="Güvenilir Hukuki Danışmanlık",
            hero_subtitle_en="Reliable Legal Consulting",
            hero_subtitle_de="Zuverlässige Rechtsberatung", 
            hero_subtitle_ru="Надежная юридическая консультация",
            hero_description_tr="Yıllarca deneyim ile müvekkillerimize en kaliteli hukuki hizmetleri sunuyoruz. Uzman ekibimiz ile her türlü hukuki meselenizde yanınızdayız.",
            hero_description_en="We provide the highest quality legal services to our clients with years of experience. We are here for all your legal matters with our expert team.",
            hero_description_de="Wir bieten unseren Mandanten mit jahrelanger Erfahrung hochwertige Rechtsdienstleistungen. Wir stehen Ihnen mit unserem Expertenteam bei allen rechtlichen Angelegenheiten zur Seite.",
            hero_description_ru="Мы предоставляем нашим клиентам высококачественные юридические услуги с многолетним опытом. Мы готовы помочь вам по всем правовым вопросам с нашей командой экспертов.",
            about_company_tr="DH Hukuk Bürosu, Avukat Deniz HANÇER tarafından kurulmuş olup, İstanbul'da hizmet vermektedir. Yerli müvekkillerin yanı sıra, yabancı müvekkillere de hizmet vermekte olan ofisimiz; güven, gizlilik ve şeffaf çalışma esaslarına özen göstermektedir.",
            about_company_en="DH Law Office was established by Attorney Deniz HANÇER and serves in Istanbul. Our office, which serves foreign clients as well as local clients; pays attention to the principles of trust, confidentiality and transparent working.",
            about_company_de="Die DH-Anwaltskanzlei wurde von Rechtsanwalt Deniz HANÇER gegründet und ist in Istanbul tätig. Unser Büro, das neben lokalen auch ausländische Mandanten betreut, achtet auf die Grundsätze von Vertrauen, Vertraulichkeit und transparenter Arbeitsweise.",
            about_company_ru="Юридическое бюро DH было создано адвокатом Дениз ХАНЧЕР и работает в Стамбуле. Наш офис, который обслуживает как местных, так и иностранных клиентов, уделяет внимание принципам доверия, конфиденциальности и прозрачной работы.",
            about_founder_tr="Deniz HANÇER, hukuk fakültesini onur öğrencisi olarak, 3 senede bitirmiş olup; halen İstanbul Üniversitesi Ticaret Hukuku dalında yüksek lisans çalışmalarına devam etmektedir.",
            about_founder_en="Deniz HANÇER graduated from law school as an honor student in 3 years and is currently continuing his graduate studies in Commercial Law at Istanbul University.",
            about_founder_de="Deniz HANÇER absolvierte die juristische Fakultät als Ehrenstudent in 3 Jahren und setzt derzeit seine Graduiertenstudien im Handelsrecht an der Universität Istanbul fort.",
            about_founder_ru="Дениз ХАНЧЕР окончил юридический факультет как студент с отличием за 3 года и в настоящее время продолжает аспирантуру по коммерческому праву в Стамбульском университете."
        )
        settings_dict = prepare_for_mongo(default_settings.dict())
        await db.site_settings.insert_one(settings_dict)
        return default_settings
    return SiteSettings(**parse_from_mongo(settings))

@api_router.put("/settings", response_model=SiteSettings)
async def update_site_settings(settings_data: SiteSettingsUpdate):
    """Update site settings"""
    settings_dict = settings_data.dict()
    settings_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Try to update existing settings
    result = await db.site_settings.update_one(
        {},
        {"$set": settings_dict},
        upsert=True
    )
    
    updated_settings = await db.site_settings.find_one({})
    return SiteSettings(**parse_from_mongo(updated_settings))

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