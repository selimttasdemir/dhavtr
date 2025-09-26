import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

// Import shadcn components
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Badge } from "./components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Separator } from "./components/ui/separator";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Multi-language content
const translations = {
  tr: {
    nav: {
      home: "Ana Sayfa",
      about: "Hakkımda",
      services: "Hizmetler",
      blog: "Blog",
      contact: "İletişim"
    },
    home: {
      hero_title: "Av. Deniz Hançer",
      hero_subtitle: "Güvenilir Hukuki Danışmanlık",
      hero_description: "Yıllarca deneyim ile müvekkillerimize en kaliteli hukuki hizmetleri sunuyoruz. Uzman ekibimiz ile her türlü hukuki meselenizde yanınızdayız.",
      contact_btn: "İletişime Geçin",
      services_title: "Hizmetlerimiz",
      why_choose: "Neden Bizi Seçmelisiniz?",
      experience: "Deneyim",
      experience_desc: "Yıllarca deneyim ile müvekkillerimize hizmet veriyoruz",
      reliability: "Güvenilirlik", 
      reliability_desc: "Müvekkillerimizin güvenini kazanmış, güvenilir hukuki danışmanlık",
      expertise: "Uzmanlık",
      expertise_desc: "Farklı hukuk alanlarında uzman kadromuz"
    },
    about: {
      title: "Hakkımda",
      content: "Av. Deniz Hançer olarak, hukuk alanında yıllarca edindiğim deneyim ile müvekkillerimize en kaliteli hizmetleri sunmaya devam ediyorum. Müvekkil memnuniyetini ön planda tutarak, her davaya özel çözümler üretiyorum."
    },
    services: {
      title: "Uzmanlık Alanlarımız",
      family_law: "Aile Hukuku",
      commercial_law: "Ticaret Hukuku", 
      criminal_law: "Ceza Hukuku",
      labor_law: "İş Hukuku",
      real_estate: "Gayrimenkul Hukuku",
      contract_law: "Sözleşme Hukuku"
    },
    contact: {
      title: "İletişim",
      form_title: "Hukuki Danışmanlık Talebi",
      name: "Adınız Soyadınız",
      email: "E-posta Adresiniz",
      phone: "Telefon Numaranız",
      subject: "Konu",
      legal_area: "Hukuki Alan",
      urgency: "Aciliyet Durumu",
      message: "Mesajınız",
      send: "Gönder",
      urgency_low: "Düşük",
      urgency_medium: "Orta",
      urgency_high: "Yüksek", 
      urgency_urgent: "Acil",
      other: "Diğer"
    },
    blog: {
      title: "Blog",
      read_more: "Devamını Oku"
    }
  },
  en: {
    nav: {
      home: "Home",
      about: "About",
      services: "Services", 
      blog: "Blog",
      contact: "Contact"
    },
    home: {
      hero_title: "Atty. Deniz Hançer",
      hero_subtitle: "Reliable Legal Consulting",
      hero_description: "We provide the highest quality legal services to our clients with years of experience. We are here for all your legal matters with our expert team.",
      contact_btn: "Get in Touch",
      services_title: "Our Services",
      why_choose: "Why Choose Us?",
      experience: "Experience",
      experience_desc: "We serve our clients with years of experience",
      reliability: "Reliability",
      reliability_desc: "Reliable legal consulting that has earned the trust of our clients",
      expertise: "Expertise", 
      expertise_desc: "Our expert staff in different areas of law"
    },
    about: {
      title: "About Me",
      content: "As Atty. Deniz Hançer, I continue to provide the highest quality services to my clients with the experience I have gained in the field of law for years. By prioritizing client satisfaction, I produce special solutions for each case."
    },
    services: {
      title: "Areas of Expertise",
      family_law: "Family Law",
      commercial_law: "Commercial Law",
      criminal_law: "Criminal Law", 
      labor_law: "Labor Law",
      real_estate: "Real Estate Law",
      contract_law: "Contract Law"
    },
    contact: {
      title: "Contact",
      form_title: "Legal Consultation Request",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      subject: "Subject",
      legal_area: "Legal Area",
      urgency: "Urgency Level",
      message: "Your Message",
      send: "Send",
      urgency_low: "Low",
      urgency_medium: "Medium", 
      urgency_high: "High",
      urgency_urgent: "Urgent",
      other: "Other"
    },
    blog: {
      title: "Blog",
      read_more: "Read More"
    }
  },
  de: {
    nav: {
      home: "Startseite",
      about: "Über mich",
      services: "Dienstleistungen",
      blog: "Blog", 
      contact: "Kontakt"
    },
    home: {
      hero_title: "RA Deniz Hançer",
      hero_subtitle: "Zuverlässige Rechtsberatung",
      hero_description: "Wir bieten unseren Mandanten mit jahrelanger Erfahrung hochwertige Rechtsdienstleistungen. Wir stehen Ihnen mit unserem Expertenteam bei allen rechtlichen Angelegenheiten zur Seite.",
      contact_btn: "Kontakt aufnehmen",
      services_title: "Unsere Dienstleistungen",
      why_choose: "Warum uns wählen?",
      experience: "Erfahrung",
      experience_desc: "Wir betreuen unsere Mandanten mit jahrelanger Erfahrung",
      reliability: "Zuverlässigkeit",
      reliability_desc: "Zuverlässige Rechtsberatung, die das Vertrauen unserer Mandanten gewonnen hat",
      expertise: "Expertise",
      expertise_desc: "Unser Expertenteam in verschiedenen Rechtsbereichen"
    },
    about: {
      title: "Über mich",
      content: "Als RA Deniz Hançer biete ich meinen Mandanten weiterhin hochwertige Dienstleistungen mit der Erfahrung, die ich im Rechtsbereich seit Jahren gesammelt habe. Mit Fokus auf Mandantenzufriedenheit entwickle ich spezielle Lösungen für jeden Fall."
    },
    services: {
      title: "Fachbereiche",
      family_law: "Familienrecht",
      commercial_law: "Handelsrecht",
      criminal_law: "Strafrecht",
      labor_law: "Arbeitsrecht", 
      real_estate: "Immobilienrecht",
      contract_law: "Vertragsrecht"
    },
    contact: {
      title: "Kontakt",
      form_title: "Rechtsberatungsanfrage",
      name: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phone: "Telefonnummer",
      subject: "Betreff",
      legal_area: "Rechtsbereich",
      urgency: "Dringlichkeitsstufe",
      message: "Ihre Nachricht",
      send: "Senden",
      urgency_low: "Niedrig",
      urgency_medium: "Mittel",
      urgency_high: "Hoch",
      urgency_urgent: "Dringend",
      other: "Andere"
    },
    blog: {
      title: "Blog",
      read_more: "Mehr lesen"
    }
  },
  ru: {
    nav: {
      home: "Главная",
      about: "Обо мне",
      services: "Услуги",
      blog: "Блог",
      contact: "Контакты"
    },
    home: {
      hero_title: "Адв. Дениз Ханчер",
      hero_subtitle: "Надежная юридическая консультация",
      hero_description: "Мы предоставляем нашим клиентам высококачественные юридические услуги с многолетним опытом. Мы готовы помочь вам по всем правовым вопросам с нашей командой экспертов.",
      contact_btn: "Связаться с нами",
      services_title: "Наши услуги",
      why_choose: "Почему выбирают нас?",
      experience: "Опыт",
      experience_desc: "Мы обслуживаем наших клиентов с многолетним опытом",
      reliability: "Надежность",
      reliability_desc: "Надежная юридическая консультация, завоевавшая доверие наших клиентов",
      expertise: "Экспертиза",
      expertise_desc: "Наша команда экспертов в различных областях права"
    },
    about: {
      title: "Обо мне",
      content: "Как адвокат Дениз Ханчер, я продолжаю предоставлять своим клиентам высококачественные услуги с опытом, накопленным в области права в течение многих лет. Уделяя приоритетное внимание удовлетворенности клиентов, я разрабатываю специальные решения для каждого дела."
    },
    services: {
      title: "Области экспертизы",
      family_law: "Семейное право",
      commercial_law: "Коммерческое право",
      criminal_law: "Уголовное право",
      labor_law: "Трудовое право",
      real_estate: "Право недвижимости",
      contract_law: "Договорное право"
    },
    contact: {
      title: "Контакты",
      form_title: "Запрос юридической консультации",
      name: "Полное имя",
      email: "Адрес электронной почты",
      phone: "Номер телефона",
      subject: "Тема",
      legal_area: "Область права",
      urgency: "Уровень срочности",
      message: "Ваше сообщение",
      send: "Отправить",
      urgency_low: "Низкий",
      urgency_medium: "Средний",
      urgency_high: "Высокий",
      urgency_urgent: "Срочный",
      other: "Другое"
    },
    blog: {
      title: "Блог",
      read_more: "Читать далее"
    }
  }
};

// Language detector
const detectLanguage = () => {
  const browserLang = navigator.language.slice(0, 2);
  return ['tr', 'en', 'de', 'ru'].includes(browserLang) ? browserLang : 'tr';
};

// Navigation Component
const Navigation = ({ currentLang, onLanguageChange }) => {
  const t = translations[currentLang];
  
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-navy-900">
          Av. Deniz Hançer
        </div>
        
        <div className="hidden md:flex space-x-8">
          <a href="#home" className="text-navy-700 hover:text-navy-900 transition-colors">{t.nav.home}</a>
          <a href="#about" className="text-navy-700 hover:text-navy-900 transition-colors">{t.nav.about}</a>
          <a href="#services" className="text-navy-700 hover:text-navy-900 transition-colors">{t.nav.services}</a>
          <a href="#blog" className="text-navy-700 hover:text-navy-900 transition-colors">{t.nav.blog}</a>
          <a href="#contact" className="text-navy-700 hover:text-navy-900 transition-colors">{t.nav.contact}</a>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={currentLang} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tr">🇹🇷 TR</SelectItem>
              <SelectItem value="en">🇺🇸 EN</SelectItem>
              <SelectItem value="de">🇩🇪 DE</SelectItem>
              <SelectItem value="ru">🇷🇺 RU</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </nav>
  );
};

// Home Component
const Home = ({ currentLang }) => {
  const t = translations[currentLang];
  
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.8), rgba(30, 58, 138, 0.8)), url('https://images.unsplash.com/photo-1589578527966-fdac0f44566c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxsYXd5ZXJ8ZW58MHx8fHwxNzU4ODYzMzIxfDA&ixlib=rb-4.1.0&q=85')`
          }}
        />
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-6xl font-bold mb-4">{t.home.hero_title}</h1>
          <p className="text-2xl mb-6">{t.home.hero_subtitle}</p>
          <p className="text-lg mb-8 max-w-3xl mx-auto">{t.home.hero_description}</p>
          <Button 
            size="lg" 
            className="bg-white text-navy-900 hover:bg-gray-100"
            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
          >
            {t.home.contact_btn}
          </Button>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-navy-900">{t.home.why_choose}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-navy-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-navy-900">{t.home.experience}</h3>
                <p className="text-gray-600">{t.home.experience_desc}</p>
              </CardContent>
            </Card>
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-navy-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-navy-900">{t.home.reliability}</h3>
                <p className="text-gray-600">{t.home.reliability_desc}</p>
              </CardContent>
            </Card>
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-navy-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-navy-900">{t.home.expertise}</h3>
                <p className="text-gray-600">{t.home.expertise_desc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

// About Component
const About = ({ currentLang }) => {
  const t = translations[currentLang];
  
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxsYXd5ZXJ8ZW58MHx8fHwxNzU4ODYzMzIxfDA&ixlib=rb-4.1.0&q=85"
              alt="Av. Deniz Hançer"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
          <div>
            <h2 className="text-4xl font-bold mb-6 text-navy-900">{t.about.title}</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">{t.about.content}</p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-navy-600 rounded-full"></div>
                <span className="text-gray-700">deniz@hancer.av.tr</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-navy-600 rounded-full"></div>
                <span className="text-gray-700">05334445566</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Services Component
const Services = ({ currentLang }) => {
  const t = translations[currentLang];
  
  const services = [
    { key: 'family_law', icon: '👨‍👩‍👧‍👦' },
    { key: 'commercial_law', icon: '🏢' },
    { key: 'criminal_law', icon: '⚖️' },
    { key: 'labor_law', icon: '👔' },
    { key: 'real_estate', icon: '🏠' },
    { key: 'contract_law', icon: '📝' }
  ];
  
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-navy-900">{t.services.title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.key} className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-navy-900">{t.services[service.key]}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Blog Component
const Blog = ({ currentLang }) => {
  const t = translations[currentLang];
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    fetchBlogPosts();
  }, []);
  
  const fetchBlogPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }
  };
  
  return (
    <section id="blog" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-navy-900">{t.blog.title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {posts.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">
              <p>Henüz blog yazısı yayınlanmamış.</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-navy-900">
                    {post[`title_${currentLang}`] || post.title_tr}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {(post[`content_${currentLang}`] || post.content_tr).substring(0, 150)}...
                  </p>
                  <Button variant="outline" size="sm">
                    {t.blog.read_more}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

// Contact Component
const Contact = ({ currentLang }) => {
  const t = translations[currentLang];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    legal_area: '',
    urgency: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post(`${API}/messages`, formData);
      alert('Mesajınız başarıyla gönderildi!');
      setFormData({
        name: '', email: '', phone: '', subject: '',
        legal_area: '', urgency: '', message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-navy-900">{t.contact.title}</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t.contact.form_title}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder={t.contact.name}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder={t.contact.email}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                  <Input
                    placeholder={t.contact.phone}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                  <Input
                    placeholder={t.contact.subject}
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    required
                  />
                  <Select value={formData.legal_area} onValueChange={(value) => handleInputChange('legal_area', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.contact.legal_area} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family_law">{t.services.family_law}</SelectItem>
                      <SelectItem value="commercial_law">{t.services.commercial_law}</SelectItem>
                      <SelectItem value="criminal_law">{t.services.criminal_law}</SelectItem>
                      <SelectItem value="labor_law">{t.services.labor_law}</SelectItem>
                      <SelectItem value="real_estate">{t.services.real_estate}</SelectItem>
                      <SelectItem value="contract_law">{t.services.contract_law}</SelectItem>
                      <SelectItem value="other">{t.contact.other}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.contact.urgency} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t.contact.urgency_low}</SelectItem>
                      <SelectItem value="medium">{t.contact.urgency_medium}</SelectItem>
                      <SelectItem value="high">{t.contact.urgency_high}</SelectItem>
                      <SelectItem value="urgent">{t.contact.urgency_urgent}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder={t.contact.message}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                    rows="4"
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-navy-700 hover:bg-navy-800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Gönderiliyor...' : t.contact.send}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-navy-900">İletişim Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-navy-700" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span>deniz@hancer.av.tr</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-navy-700" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>05334445566</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div 
              className="h-64 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxsYXd5ZXJ8ZW58MHx8fHwxNzU4ODYzMzIxfDA&ixlib=rb-4.1.0&q=85')`
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Main App Component
function App() {
  const [currentLang, setCurrentLang] = useState(() => {
    const saved = localStorage.getItem('preferred-language');
    return saved || detectLanguage();
  });
  
  useEffect(() => {
    localStorage.setItem('preferred-language', currentLang);
  }, [currentLang]);
  
  const handleLanguageChange = (lang) => {
    setCurrentLang(lang);
  };
  
  return (
    <div className="App">
      <Navigation currentLang={currentLang} onLanguageChange={handleLanguageChange} />
      
      <Home currentLang={currentLang} />
      <About currentLang={currentLang} />
      <Services currentLang={currentLang} />
      <Blog currentLang={currentLang} />
      <Contact currentLang={currentLang} />
      
      <footer className="bg-navy-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Av. Deniz Hançer. Tüm hakları saklıdır.</p>
          <p className="mt-2 text-navy-300">hancer.av.tr</p>
        </div>
      </footer>
    </div>
  );
}

export default App;