from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from enum import Enum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from database import (
    get_database, create_tables, 
    ContactMessageDB, BlogPostDB, AdminUserDB, SiteSettingsDB, PasswordResetDB
)
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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
    PROJECT_FINANCING = "project_financing"
    BANKING_FINANCE = "banking_finance"
    CORPORATE_LAW = "corporate_law"
    MARITIME_LAW = "maritime_law"
    MERGERS_ACQUISITIONS = "mergers_acquisitions"
    ENERGY_LAW = "energy_law"
    COMPETITION_LAW = "competition_law"
    CAPITAL_MARKETS = "capital_markets"
    DISPUTE_RESOLUTION = "dispute_resolution"
    LABOR_LAW = "labor_law"
    COMPLIANCE = "compliance"
    REAL_ESTATE = "real_estate"
    RESTRUCTURING = "restructuring"
    CRIMINAL_LAW = "criminal_law"
    FAMILY_LAW = "family_law"
    ADMINISTRATIVE_LAW = "administrative_law"
    IMMIGRATION_LAW = "immigration_law"
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

class AdminSetupRequest(BaseModel):
    username: str
    password: str

class AdminLoginRequest(BaseModel):
    username: str
    password: str

# Helper functions
def db_to_pydantic_message(db_obj) -> ContactMessage:
    return ContactMessage(
        id=db_obj.id,
        name=db_obj.name,
        email=db_obj.email,
        phone=db_obj.phone,
        subject=db_obj.subject,
        legal_area=db_obj.legal_area,
        urgency=db_obj.urgency,
        message=db_obj.message,
        created_at=db_obj.created_at,
        is_read=db_obj.is_read
    )

def db_to_pydantic_blog(db_obj) -> BlogPost:
    return BlogPost(
        id=db_obj.id,
        title_tr=db_obj.title_tr,
        title_en=db_obj.title_en,
        title_de=db_obj.title_de,
        title_ru=db_obj.title_ru,
        content_tr=db_obj.content_tr,
        content_en=db_obj.content_en,
        content_de=db_obj.content_de,
        content_ru=db_obj.content_ru,
        slug=db_obj.slug,
        published=db_obj.published,
        created_at=db_obj.created_at,
        updated_at=db_obj.updated_at
    )

def db_to_pydantic_settings(db_obj) -> SiteSettings:
    return SiteSettings(
        id=db_obj.id,
        logo_url=db_obj.logo_url or "",
        hero_title_tr=db_obj.hero_title_tr or "",
        hero_title_en=db_obj.hero_title_en or "",
        hero_title_de=db_obj.hero_title_de or "",
        hero_title_ru=db_obj.hero_title_ru or "",
        hero_subtitle_tr=db_obj.hero_subtitle_tr or "",
        hero_subtitle_en=db_obj.hero_subtitle_en or "",
        hero_subtitle_de=db_obj.hero_subtitle_de or "",
        hero_subtitle_ru=db_obj.hero_subtitle_ru or "",
        hero_description_tr=db_obj.hero_description_tr or "",
        hero_description_en=db_obj.hero_description_en or "",
        hero_description_de=db_obj.hero_description_de or "",
        hero_description_ru=db_obj.hero_description_ru or "",
        about_company_tr=db_obj.about_company_tr or "",
        about_company_en=db_obj.about_company_en or "",
        about_company_de=db_obj.about_company_de or "",
        about_company_ru=db_obj.about_company_ru or "",
        about_founder_tr=db_obj.about_founder_tr or "",
        about_founder_en=db_obj.about_founder_en or "",
        about_founder_de=db_obj.about_founder_de or "",
        about_founder_ru=db_obj.about_founder_ru or "",
        created_at=db_obj.created_at,
        updated_at=db_obj.updated_at
    )

# API Routes

# Contact Messages
@api_router.post("/messages", response_model=ContactMessage)
async def create_message(message_data: ContactMessageCreate, db: AsyncSession = Depends(get_database)):
    """Create a new contact message"""
    message_id = str(uuid.uuid4())
    db_message = ContactMessageDB(
        id=message_id,
        name=message_data.name,
        email=message_data.email,
        phone=message_data.phone,
        subject=message_data.subject,
        legal_area=message_data.legal_area.value,
        urgency=message_data.urgency.value,
        message=message_data.message,
        created_at=datetime.now(timezone.utc),
        is_read=False
    )
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)
    return db_to_pydantic_message(db_message)

@api_router.get("/messages", response_model=List[ContactMessage])
async def get_messages(db: AsyncSession = Depends(get_database)):
    """Get all contact messages (admin only)"""
    result = await db.execute(select(ContactMessageDB).order_by(ContactMessageDB.created_at.desc()))
    messages = result.scalars().all()
    return [db_to_pydantic_message(msg) for msg in messages]

@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str, db: AsyncSession = Depends(get_database)):
    """Delete a contact message"""
    result = await db.execute(delete(ContactMessageDB).where(ContactMessageDB.id == message_id))
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted successfully"}

@api_router.put("/messages/{message_id}/read")
async def mark_message_read(message_id: str, db: AsyncSession = Depends(get_database)):
    """Mark message as read"""
    result = await db.execute(
        update(ContactMessageDB)
        .where(ContactMessageDB.id == message_id)
        .values(is_read=True)
    )
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message marked as read"}

# Blog Posts
@api_router.post("/blog", response_model=BlogPost)
async def create_blog_post(post_data: BlogPostCreate, db: AsyncSession = Depends(get_database)):
    """Create a new blog post"""
    post_id = str(uuid.uuid4())
    db_post = BlogPostDB(
        id=post_id,
        title_tr=post_data.title_tr,
        title_en=post_data.title_en,
        title_de=post_data.title_de,
        title_ru=post_data.title_ru,
        content_tr=post_data.content_tr,
        content_en=post_data.content_en,
        content_de=post_data.content_de,
        content_ru=post_data.content_ru,
        slug=post_data.slug,
        published=post_data.published,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(db_post)
    await db.commit()
    await db.refresh(db_post)
    return db_to_pydantic_blog(db_post)

@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts(published_only: bool = True, db: AsyncSession = Depends(get_database)):
    """Get blog posts"""
    query = select(BlogPostDB).order_by(BlogPostDB.created_at.desc())
    if published_only:
        query = query.where(BlogPostDB.published == True)
    
    result = await db.execute(query)
    posts = result.scalars().all()
    return [db_to_pydantic_blog(post) for post in posts]

@api_router.get("/blog/{post_id}", response_model=BlogPost)
async def get_blog_post(post_id: str, db: AsyncSession = Depends(get_database)):
    """Get a specific blog post"""
    result = await db.execute(select(BlogPostDB).where(BlogPostDB.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return db_to_pydantic_blog(post)

@api_router.put("/blog/{post_id}", response_model=BlogPost)
async def update_blog_post(post_id: str, post_data: BlogPostCreate, db: AsyncSession = Depends(get_database)):
    """Update a blog post"""
    result = await db.execute(
        update(BlogPostDB)
        .where(BlogPostDB.id == post_id)
        .values(
            title_tr=post_data.title_tr,
            title_en=post_data.title_en,
            title_de=post_data.title_de,
            title_ru=post_data.title_ru,
            content_tr=post_data.content_tr,
            content_en=post_data.content_en,
            content_de=post_data.content_de,
            content_ru=post_data.content_ru,
            slug=post_data.slug,
            published=post_data.published,
            updated_at=datetime.now(timezone.utc)
        )
    )
    await db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    result = await db.execute(select(BlogPostDB).where(BlogPostDB.id == post_id))
    updated_post = result.scalar_one()
    return db_to_pydantic_blog(updated_post)

@api_router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str, db: AsyncSession = Depends(get_database)):
    """Delete a blog post"""
    result = await db.execute(delete(BlogPostDB).where(BlogPostDB.id == post_id))
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"message": "Blog post deleted successfully"}

# Site Settings
@api_router.get("/settings", response_model=SiteSettings)
async def get_site_settings(db: AsyncSession = Depends(get_database)):
    """Get site settings"""
    result = await db.execute(select(SiteSettingsDB))
    settings = result.scalar_one_or_none()
    
    if not settings:
        # Create default settings if none exist
        settings_id = str(uuid.uuid4())
        default_settings = SiteSettingsDB(
            id=settings_id,
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
            about_founder_ru="Дениз ХАНЧЕР окончил юридический факультет как студент с отличием за 3 года и в настоящее время продолжает аспирантуру по коммерческому праву в Стамбульском университете.",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(default_settings)
        await db.commit()
        await db.refresh(default_settings)
        return db_to_pydantic_settings(default_settings)
    
    return db_to_pydantic_settings(settings)

@api_router.put("/settings", response_model=SiteSettings)
async def update_site_settings(settings_data: SiteSettingsUpdate, db: AsyncSession = Depends(get_database)):
    """Update site settings"""
    result = await db.execute(select(SiteSettingsDB))
    existing_settings = result.scalar_one_or_none()
    
    if existing_settings:
        # Update existing settings
        await db.execute(
            update(SiteSettingsDB)
            .where(SiteSettingsDB.id == existing_settings.id)
            .values(
                logo_url=settings_data.logo_url,
                hero_title_tr=settings_data.hero_title_tr,
                hero_title_en=settings_data.hero_title_en,
                hero_title_de=settings_data.hero_title_de,
                hero_title_ru=settings_data.hero_title_ru,
                hero_subtitle_tr=settings_data.hero_subtitle_tr,
                hero_subtitle_en=settings_data.hero_subtitle_en,
                hero_subtitle_de=settings_data.hero_subtitle_de,
                hero_subtitle_ru=settings_data.hero_subtitle_ru,
                hero_description_tr=settings_data.hero_description_tr,
                hero_description_en=settings_data.hero_description_en,
                hero_description_de=settings_data.hero_description_de,
                hero_description_ru=settings_data.hero_description_ru,
                about_company_tr=settings_data.about_company_tr,
                about_company_en=settings_data.about_company_en,
                about_company_de=settings_data.about_company_de,
                about_company_ru=settings_data.about_company_ru,
                about_founder_tr=settings_data.about_founder_tr,
                about_founder_en=settings_data.about_founder_en,
                about_founder_de=settings_data.about_founder_de,
                about_founder_ru=settings_data.about_founder_ru,
                updated_at=datetime.now(timezone.utc)
            )
        )
    else:
        # Create new settings
        settings_id = str(uuid.uuid4())
        new_settings = SiteSettingsDB(
            id=settings_id,
            **settings_data.dict(),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_settings)
    
    await db.commit()
    
    # Return updated settings
    result = await db.execute(select(SiteSettingsDB))
    updated_settings = result.scalar_one()
    return db_to_pydantic_settings(updated_settings)

# Admin routes
@api_router.get("/admin/check-setup")
async def check_admin_setup(db: AsyncSession = Depends(get_database)):
    """Check if admin user exists"""
    result = await db.execute(select(AdminUserDB))
    admin = result.scalar_one_or_none()
    return {"has_admin": admin is not None}

@api_router.delete("/admin/reset")
async def reset_admin(db: AsyncSession = Depends(get_database)):
    """Reset admin users - for development only"""
    await db.execute(delete(AdminUserDB))
    await db.commit()
    return {"message": "Admin users reset successfully"}

@api_router.post("/admin/setup")
async def setup_admin(request: AdminSetupRequest, db: AsyncSession = Depends(get_database)):
    """Setup initial admin user"""
    # Check if admin already exists
    result = await db.execute(select(AdminUserDB))
    existing_admin = result.scalar_one_or_none()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin user already exists")
    
    # Simple password hashing
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    
    admin_id = str(uuid.uuid4())
    admin_user = AdminUserDB(
        id=admin_id,
        username=request.username,
        password_hash=password_hash,
        created_at=datetime.now(timezone.utc),
        is_active=True
    )
    db.add(admin_user)
    await db.commit()
    
    return {"message": "Admin user created successfully"}

@api_router.post("/admin/login")
async def admin_login(request: AdminLoginRequest, db: AsyncSession = Depends(get_database)):
    """Admin login"""
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    
    result = await db.execute(
        select(AdminUserDB).where(
            AdminUserDB.username == request.username,
            AdminUserDB.password_hash == password_hash,
            AdminUserDB.is_active == True
        )
    )
    admin = result.scalar_one_or_none()
    
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"message": "Login successful", "admin_id": admin.id}

@api_router.post("/admin/change-password")
async def change_admin_password(request: PasswordChangeRequest, db: AsyncSession = Depends(get_database)):
    """Change admin password"""
    current_password_hash = hashlib.sha256(request.current_password.encode()).hexdigest()
    
    result = await db.execute(
        select(AdminUserDB).where(
            AdminUserDB.password_hash == current_password_hash,
            AdminUserDB.is_active == True
        )
    )
    admin = result.scalar_one_or_none()
    
    if not admin:
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    new_password_hash = hashlib.sha256(request.new_password.encode()).hexdigest()
    
    await db.execute(
        update(AdminUserDB)
        .where(AdminUserDB.id == admin.id)
        .values(password_hash=new_password_hash)
    )
    await db.commit()
    
    return {"message": "Password changed successfully"}

@api_router.post("/admin/forgot-password")
async def forgot_password(request: PasswordResetRequest, db: AsyncSession = Depends(get_database)):
    """Send password reset email"""
    result = await db.execute(
        select(AdminUserDB).where(
            AdminUserDB.username == request.email,
            AdminUserDB.is_active == True
        )
    )
    admin = result.scalar_one_or_none()
    
    if not admin:
        return {"message": "If an account with this email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = str(uuid.uuid4())
    reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store reset token
    reset_record = PasswordResetDB(
        admin_id=admin.id,
        token=reset_token,
        expires_at=reset_expires,
        used=False
    )
    db.add(reset_record)
    await db.commit()
    
    # Return reset link for demo
    reset_link = f"https://hancer-attorney.preview.emergentagent.com/admin/reset-password?token={reset_token}"
    
    return {"message": "Reset link sent", "reset_link": reset_link}

@api_router.post("/admin/reset-password")
async def reset_password(token: str, new_password: str, db: AsyncSession = Depends(get_database)):
    """Reset password with token"""
    result = await db.execute(
        select(PasswordResetDB).where(
            PasswordResetDB.token == token,
            PasswordResetDB.used == False
        )
    )
    reset_record = result.scalar_one_or_none()
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check if token is expired
    if datetime.now(timezone.utc) > reset_record.expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Update password
    new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    await db.execute(
        update(AdminUserDB)
        .where(AdminUserDB.id == reset_record.admin_id)
        .values(password_hash=new_password_hash)
    )
    
    # Mark token as used
    await db.execute(
        update(PasswordResetDB)
        .where(PasswordResetDB.id == reset_record.id)
        .values(used=True)
    )
    await db.commit()
    
    return {"message": "Password reset successfully"}

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

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    await create_tables()
    logger.info("Database tables created successfully")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down")