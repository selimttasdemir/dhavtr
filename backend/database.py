from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer
from datetime import datetime, timezone
import uuid
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
DATABASE_URL = f"sqlite+aiosqlite:///{ROOT_DIR}/hancer_law.db"

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

Base = declarative_base()

class ContactMessageDB(Base):
    __tablename__ = "contact_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    legal_area = Column(String, nullable=False)
    urgency = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_read = Column(Boolean, default=False)

class BlogPostDB(Base):
    __tablename__ = "blog_posts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title_tr = Column(String, nullable=False)
    title_en = Column(String, nullable=False)
    title_de = Column(String, nullable=False)
    title_ru = Column(String, nullable=False)
    content_tr = Column(Text, nullable=False)
    content_en = Column(Text, nullable=False)
    content_de = Column(Text, nullable=False)
    content_ru = Column(Text, nullable=False)
    slug = Column(String, nullable=False, unique=True)
    published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AdminUserDB(Base):
    __tablename__ = "admin_users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

class SiteSettingsDB(Base):
    __tablename__ = "site_settings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    logo_url = Column(String, default="")
    hero_title_tr = Column(String, default="")
    hero_title_en = Column(String, default="")
    hero_title_de = Column(String, default="")
    hero_title_ru = Column(String, default="")
    hero_subtitle_tr = Column(String, default="")
    hero_subtitle_en = Column(String, default="")
    hero_subtitle_de = Column(String, default="")
    hero_subtitle_ru = Column(String, default="")
    hero_description_tr = Column(Text, default="")
    hero_description_en = Column(Text, default="")
    hero_description_de = Column(Text, default="")
    hero_description_ru = Column(Text, default="")
    about_company_tr = Column(Text, default="")
    about_company_en = Column(Text, default="")
    about_company_de = Column(Text, default="")
    about_company_ru = Column(Text, default="")
    about_founder_tr = Column(Text, default="")
    about_founder_en = Column(Text, default="")
    about_founder_de = Column(Text, default="")
    about_founder_ru = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class PasswordResetDB(Base):
    __tablename__ = "password_resets"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    admin_id = Column(String, nullable=False)
    token = Column(String, nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)

# Create tables
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Dependency to get database session
async def get_database():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()