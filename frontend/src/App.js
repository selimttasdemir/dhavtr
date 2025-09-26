import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useParams, Link } from "react-router-dom";
import axios from "axios";
import AdminPanel from "./components/AdminPanel";

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
      title: "Hakkımızda",
      company_title: "DH Hukuk Bürosu",
      founder_title: "Kurucumuz"
    },
    services: {
      title: "Hizmetlerimiz",
      back_to_services: "Hizmetlere Geri Dön"
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
      other: "Diğer",
      contact_info: "İletişim Bilgileri",
      location: "Konum"
    },
    blog: {
      title: "Blog",
      read_more: "Devamını Oku",
      back_to_blog: "Bloga Geri Dön"
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
      title: "About Us",
      company_title: "DH Law Office",
      founder_title: "Our Founder"
    },
    services: {
      title: "Our Services",
      back_to_services: "Back to Services"
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
      other: "Other",
      contact_info: "Contact Information",
      location: "Location"
    },
    blog: {
      title: "Blog",
      read_more: "Read More",
      back_to_blog: "Back to Blog"
    }
  },
  de: {
    nav: {
      home: "Startseite",
      about: "Über uns",
      services: "Dienstleistungen",
      blog: "Blog", 
      contact: "Kontakt"
    },
    home: {
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
      title: "Über uns",
      company_title: "DH Rechtsanwaltskanzlei",
      founder_title: "Unser Gründer"
    },
    services: {
      title: "Unsere Dienstleistungen",
      back_to_services: "Zurück zu Dienstleistungen"
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
      other: "Andere",
      contact_info: "Kontaktinformationen",
      location: "Standort"
    },
    blog: {
      title: "Blog",
      read_more: "Mehr lesen",
      back_to_blog: "Zurück zum Blog"
    }
  },
  ru: {
    nav: {
      home: "Главная",
      about: "О нас",
      services: "Услуги",
      blog: "Блог",
      contact: "Контакты"
    },
    home: {
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
      title: "О нас",
      company_title: "Юридическое бюро DH",
      founder_title: "Наш основатель"
    },
    services: {
      title: "Наши услуги",
      back_to_services: "Обратно к услугам"
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
      other: "Другое",
      contact_info: "Контактная информация",
      location: "Местоположение"
    },
    blog: {
      title: "Блог",
      read_more: "Читать далее",
      back_to_blog: "Обратно к блогу"
    }
  }
};

// Language detector
const detectLanguage = () => {
  const browserLang = navigator.language.slice(0, 2);
  return ['tr', 'en', 'de', 'ru'].includes(browserLang) ? browserLang : 'tr';
};

// Complete Services data (17 services)
const servicesData = [
  {
    id: 1,
    title_tr: "Proje Finansmanı",
    title_en: "Project Financing",
    title_de: "Projektfinanzierung", 
    title_ru: "Проектное финансирование",
    description_tr: "Proje finansmanı süreçlerinin yürütülmesi noktasında müvekkillerimize danışmanlık sağlıyoruz. Özellikle yatırım noktasında tıkanmış büyük çaplı projelere doğru aksiyon planları ile etkin çözümler getiriyoruz.",
    description_en: "We provide consultancy to our clients in the execution of project financing processes. We bring effective solutions with proper action plans, especially to large-scale projects stuck in investment.",
    description_de: "Wir bieten unseren Mandanten Beratung bei der Durchführung von Projektfinanzierungsprozessen. Wir bringen effektive Lösungen mit richtigen Aktionsplänen, insbesondere für große Projekte.",
    description_ru: "Мы предоставляем консультации нашим клиентам по выполнению процессов проектного финансирования."
  },
  {
    id: 2,
    title_tr: "Bankacılık & Finans",
    title_en: "Banking & Finance",
    title_de: "Bankwesen & Finanzen",
    title_ru: "Банковское дело и финансы",
    description_tr: "Bankacılık ve finans sektöründe karmaşık işlemlerde hukuki danışmanlık hizmetleri sunuyoruz. Kredi sözleşmeleri, finansal enstrümanlar ve bankacılık düzenlemeleri konularında uzmanız.",
    description_en: "We provide legal consultancy services in complex transactions in the banking and finance sector. We specialize in credit agreements, financial instruments and banking regulations.",
    description_de: "Wir bieten Rechtsberatungsdienste für komplexe Transaktionen im Banken- und Finanzsektor. Wir sind auf Kreditverträge, Finanzinstrumente und Bankvorschriften spezialisiert.",
    description_ru: "Мы предоставляем услуги юридических консультаций по сложным операциям в банковском и финансовом секторе."
  },
  {
    id: 3,
    title_tr: "Şirketler & Ticaret Hukuku",
    title_en: "Corporate & Commercial Law",
    title_de: "Gesellschafts- & Handelsrecht",
    title_ru: "Корпоративное и коммерческое право",
    description_tr: "Şirket kuruluşu, birleşme, devralma ve ticari işlemlerde hukuki destek sağlıyoruz. Kurumsal yönetim, pay devri ve ticari sözleşmeler konularında danışmanlık veriyoruz.",
    description_en: "We provide legal support in company establishment, mergers, acquisitions and commercial transactions. We provide consultancy on corporate governance, share transfer and commercial contracts.",
    description_de: "Wir bieten Rechtsberatung bei Unternehmensgründung, Fusionen, Übernahmen und Handelsgeschäften. Wir beraten zu Unternehmensführung, Anteilsübertragung und Handelsverträgen.",
    description_ru: "Мы предоставляем правовую поддержку при создании компаний, слияниях, поглощениях и коммерческих сделках."
  },
  {
    id: 4,
    title_tr: "Deniz Ticareti Hukuku",
    title_en: "Maritime Commercial Law",
    title_de: "Seehandelsrecht",
    title_ru: "Морское коммерческое право",
    description_tr: "Gemi alım-satımı, navlun sözleşmeleri, deniz sigortası ve denizcilik uyuşmazlıkları konularında hizmet veriyoruz. Liman işletmeleri ve denizcilik şirketlerine özel danışmanlık sağlıyoruz.",
    description_en: "We provide services on ship purchase-sale, freight contracts, marine insurance and maritime disputes. We provide special consultancy to port operators and shipping companies.",
    description_de: "Wir bieten Dienstleistungen für Schiffskauf und -verkauf, Frachtverträge, Seeversicherung und Seestreitigkeiten. Wir beraten Hafenbetreiber und Reedereien.",
    description_ru: "Мы предоставляем услуги по купле-продаже судов, фрахтовым договорам, морскому страхованию и морским спорам."
  },
  {
    id: 5,
    title_tr: "Birleşme & Devralmalar",
    title_en: "Mergers & Acquisitions",
    title_de: "Fusionen & Übernahmen",
    title_ru: "Слияния и поглощения",
    description_tr: "Şirket birleşmeleri, devralmaları ve yapısal dönüşümlerde kapsamlı hukuki danışmanlık sunuyoruz. Due diligence süreçlerinde ve işlem yapılandırmasında rehberlik ediyoruz.",
    description_en: "We provide comprehensive legal consultancy in company mergers, acquisitions and structural transformations. We guide in due diligence processes and transaction structuring.",
    description_de: "Wir bieten umfassende Rechtsberatung bei Unternehmensfusionen, Übernahmen und strukturellen Transformationen. Wir leiten Due-Diligence-Prozesse und Transaktionsstrukturen.",
    description_ru: "Мы предоставляем комплексные юридические консультации по слияниям, поглощениям компаний и структурным преобразованиям."
  },
  {
    id: 6,
    title_tr: "Enerji Hukuku",
    title_en: "Energy Law",
    title_de: "Energierecht",
    title_ru: "Энергетическое право",
    description_tr: "Yenilenebilir enerji projeleri, enerji lisansları ve enerji sektöründeki düzenlemeler konusunda uzmanlık sunuyoruz. Güneş, rüzgar ve diğer enerji yatırımlarında danışmanlık veriyoruz.",
    description_en: "We offer expertise in renewable energy projects, energy licenses and regulations in the energy sector. We provide consultancy on solar, wind and other energy investments.",
    description_de: "Wir bieten Expertise bei Projekten für erneuerbare Energien, Energielizenzen und Vorschriften im Energiesektor. Wir beraten bei Solar-, Wind- und anderen Energieinvestitionen.",
    description_ru: "Мы предлагаем экспертизу по проектам возобновляемой энергии, энергетическим лицензиям и регулированию в энергетическом секторе."
  },
  {
    id: 7,
    title_tr: "Rekabet Hukuku",
    title_en: "Competition Law",
    title_de: "Wettbewerbsrecht",
    title_ru: "Конкурентное право",
    description_tr: "Rekabet Kurumu önündeki işlemler, hakim durum tespiti ve rekabet hukuku uyuşmazlıklarında deneyimli kadromuzla hizmet veriyoruz. Kartel ve tekel davalarında uzmanız.",
    description_en: "We serve with our experienced team in procedures before the Competition Authority, determination of dominant position and competition law disputes. We specialize in cartel and monopoly cases.",
    description_de: "Wir dienen mit unserem erfahrenen Team bei Verfahren vor der Wettbewerbsbehörde, der Bestimmung einer marktbeherrschenden Stellung und wettbewerbsrechtlichen Streitigkeiten.",
    description_ru: "Мы работаем с нашей опытной командой по процедурам перед органом по конкуренции, определению доминирующего положения и спорам по конкурентному праву."
  },
  {
    id: 8,
    title_tr: "Sermaye Piyasası Hukuku",
    title_en: "Capital Markets Law",
    title_de: "Kapitalmarktrecht",
    title_ru: "Право рынков капитала",
    description_tr: "Halka arz işlemleri, sermaye piyasası araçları ve SPK düzenlemeleri konularında hizmet veriyoruz. Yatırım fonları ve portföy yönetimi şirketlerine danışmanlık sağlıyoruz.",
    description_en: "We provide services on public offerings, capital market instruments and CMB regulations. We provide consultancy to investment funds and portfolio management companies.",
    description_de: "Wir bieten Dienstleistungen für öffentliche Angebote, Kapitalmarktinstrumente und CMB-Vorschriften. Wir beraten Investmentfonds und Portfolioverwaltungsunternehmen.",
    description_ru: "Мы предоставляем услуги по публичным предложениям, инструментам рынка капитала и регулированию CMB."
  },
  {
    id: 9,
    title_tr: "Dava ve Uyuşmazlık Çözümleri",
    title_en: "Litigation and Dispute Resolution",
    title_de: "Rechtsstreitigkeiten und Streitbeilegung",
    title_ru: "Судебные разбирательства и разрешение споров",
    description_tr: "Ticari davalar, tahkim süreçleri ve alternatif uyuşmazlık çözüm yöntemlerinde deneyimli kadromuzla hizmet veriyoruz. Ulusal ve uluslararası tahkimde temsil ediyoruz.",
    description_en: "We serve with our experienced team in commercial litigation, arbitration processes and alternative dispute resolution methods. We represent in national and international arbitration.",
    description_de: "Wir dienen mit unserem erfahrenen Team bei Handelsstreitigkeiten, Schiedsverfahren und alternativen Streitbeilegungsmethoden. Wir vertreten bei nationaler und internationaler Schiedsgerichtsbarkeit.",
    description_ru: "Мы работаем с нашей опытной командой по коммерческим спорам, арбитражным процессам и альтернативным методам разрешения споров."
  },
  {
    id: 10,
    title_tr: "İş Hukuku",
    title_en: "Labor Law",
    title_de: "Arbeitsrecht",
    title_ru: "Трудовое право",
    description_tr: "İş sözleşmeleri, işçi hakları, iş sağlığı ve güvenliği mevzuatı konularında hizmet veriyoruz. İşveren ve işçi temsilcilerine eşit mesafede danışmanlık sağlıyoruz.",
    description_en: "We provide services on employment contracts, workers' rights, occupational health and safety legislation. We provide equal consultancy to employer and worker representatives.",
    description_de: "Wir bieten Dienstleistungen zu Arbeitsverträgen, Arbeitnehmerrechten und Arbeitsschutzgesetzgebung. Wir beraten Arbeitgeber- und Arbeitnehmervertreter gleichermaßen.",
    description_ru: "Мы предоставляем услуги по трудовым договорам, правам работников, законодательству об охране труда и технике безопасности."
  },
  {
    id: 11,
    title_tr: "Mevzuata Uyum (KVKK, E-Ticaret)",
    title_en: "Compliance (GDPR, E-Commerce)",
    title_de: "Compliance (DSGVO, E-Commerce)",
    title_ru: "Соответствие (GDPR, электронная коммерция)",
    description_tr: "KVKK uyum süreçleri, e-ticaret mevzuatı ve veri koruma politikaları konularında danışmanlık veriyoruz. Dijital dönüşüm süreçlerinde hukuki rehberlik sağlıyoruz.",
    description_en: "We provide consultancy on GDPR compliance processes, e-commerce legislation and data protection policies. We provide legal guidance in digital transformation processes.",
    description_de: "Wir beraten zu DSGVO-Compliance-Prozessen, E-Commerce-Gesetzgebung und Datenschutzrichtlinien. Wir bieten rechtliche Beratung bei digitalen Transformationsprozessen.",
    description_ru: "Мы консультируем по процессам соответствия GDPR, законодательству электронной коммерции и политикам защиты данных."
  },
  {
    id: 12,
    title_tr: "Gayrimenkul Hukuku",
    title_en: "Real Estate Law",
    title_de: "Immobilienrecht",
    title_ru: "Право недвижимости",
    description_tr: "Gayrimenkul alım-satımı, kira sözleşmeleri, kat irtifakı ve tapu işlemleri konularında hizmet veriyoruz. Gayrimenkul yatırım projelerinde hukuki danışmanlık sağlıyoruz.",
    description_en: "We provide services on real estate purchase-sale, rental agreements, condominium rights and title deed transactions. We provide legal consultancy in real estate investment projects.",
    description_de: "Wir bieten Dienstleistungen für Immobilienkauf und -verkauf, Mietverträge, Eigentumswohnungsrechte und Grundbuchgeschäfte. Wir beraten bei Immobilieninvestitionsprojekten.",
    description_ru: "Мы предоставляем услуги по купле-продаже недвижимости, договорам аренды, правам кондоминиума и операциям с правом собственности."
  },
  {
    id: 13,
    title_tr: "Yeniden Yapılandırma & İflas/Konkordato",
    title_en: "Restructuring & Bankruptcy/Concordat",
    title_de: "Umstrukturierung & Insolvenz/Konkordato",
    title_ru: "Реструктуризация и банкротство/конкордат",
    description_tr: "Finansal sıkıntı yaşayan şirketlerin yeniden yapılandırma süreçlerinde rehberlik ediyoruz. İflas ve konkordato davalarında deneyimli kadromuzla hizmet veriyoruz.",
    description_en: "We guide companies experiencing financial distress through restructuring processes. We serve with our experienced team in bankruptcy and concordat cases.",
    description_de: "Wir begleiten Unternehmen in finanziellen Schwierigkeiten durch Umstrukturierungsprozesse. Wir dienen mit unserem erfahrenen Team bei Insolvenz- und Konkordato-Fällen.",
    description_ru: "Мы направляем компании, испытывающие финансовые затруднения, через процессы реструктуризации."
  },
  {
    id: 14,
    title_tr: "Ceza Hukuku",
    title_en: "Criminal Law",
    title_de: "Strafrecht",
    title_ru: "Уголовное право",
    description_tr: "Beyaz yakalı suçlar, ekonomik suçlar ve ticari ceza davaları konularında hizmet veriyoruz. Şirket yöneticileri ve gerçek kişiler için ceza hukuku danışmanlığı sağlıyoruz.",
    description_en: "We provide services on white-collar crimes, economic crimes and commercial criminal cases. We provide criminal law consultancy for company executives and individuals.",
    description_de: "Wir bieten Dienstleistungen zu Wirtschaftskriminalität, Wirtschaftsverbrechen und kommerziellen Strafsachen. Wir beraten Unternehmensführer und Einzelpersonen im Strafrecht.",
    description_ru: "Мы предоставляем услуги по преступлениям белых воротничков, экономическим преступлениям и коммерческим уголовным делам."
  },
  {
    id: 15,
    title_tr: "Aile Hukuku",
    title_en: "Family Law",
    title_de: "Familienrecht",
    title_ru: "Семейное право",
    description_tr: "Boşanma davaları, velayet anlaşmazlıkları, nafaka hesaplamaları ve mal paylaşımı konularında hizmet veriyoruz. Aile içi uyuşmazlıklarda çözüm odaklı yaklaşım sergiliyoruz.",
    description_en: "We provide services on divorce cases, custody disputes, alimony calculations and property sharing. We adopt a solution-oriented approach in family disputes.",
    description_de: "Wir bieten Dienstleistungen bei Scheidungsfällen, Sorgerechtsstreitigkeiten, Unterhaltsberechnungen und Vermögensteilung. Wir verfolgen einen lösungsorientierten Ansatz bei Familienstreitigkeiten.",
    description_ru: "Мы предоставляем услуги по делам о разводе, спорам об опеке, расчетам алиментов и разделу имущества."
  },
  {
    id: 16,
    title_tr: "İdare Hukuku",
    title_en: "Administrative Law",
    title_de: "Verwaltungsrecht",
    title_ru: "Административное право",
    description_tr: "İdari işlemler, kamu ihaleleri ve idari yargı süreçlerinde hizmet veriyoruz. Kamu kurumları ile olan uyuşmazlıklarda müvekkillerimizi temsil ediyoruz.",
    description_en: "We provide services in administrative procedures, public tenders and administrative judicial processes. We represent our clients in disputes with public institutions.",
    description_de: "Wir bieten Dienstleistungen bei Verwaltungsverfahren, öffentlichen Ausschreibungen und verwaltungsgerichtlichen Verfahren. Wir vertreten unsere Mandanten bei Streitigkeiten mit öffentlichen Einrichtungen.",
    description_ru: "Мы предоставляем услуги по административным процедурам, государственным тендерам и административным судебным процессам."
  },
  {
    id: 17,
    title_tr: "Yabancılar Hukuku",
    title_en: "Immigration Law",
    title_de: "Ausländerrecht",
    title_ru: "Иммиграционное право",
    description_tr: "Oturma izinleri, çalışma izinleri, vatandaşlık başvuruları ve sınır dışı süreçleri konularında hizmet veriyoruz. Yabancı yatırımcılar için kapsamlı danışmanlık sağlıyoruz.",
    description_en: "We provide services on residence permits, work permits, citizenship applications and deportation processes. We provide comprehensive consultancy for foreign investors.",
    description_de: "Wir bieten Dienstleistungen zu Aufenthaltsgenehmigungen, Arbeitserlaubnissen, Staatsangehörigkeitsanträgen und Abschiebungsverfahren. Wir beraten ausländische Investoren umfassend.",
    description_ru: "Мы предоставляем услуги по видам на жительство, разрешениям на работу, заявлениям на гражданство и процедурам депортации."
  }
];

// Navigation Component
const Navigation = ({ currentLang, onLanguageChange, siteSettings }) => {
  const t = translations[currentLang];
  
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {siteSettings?.logo_url ? (
            <img 
              src={siteSettings.logo_url} 
              alt="DH Hukuk Logo" 
              className="h-12 object-contain"
            />
          ) : (
            <div className="text-2xl font-bold text-navy-900">
              DH Hukuk
            </div>
          )}
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
const Home = ({ currentLang, siteSettings }) => {
  const t = translations[currentLang];
  
  // Get hero content from settings or fallback to translations
  const heroTitle = siteSettings?.[`hero_title_${currentLang}`] || t.home?.hero_title || "Av. Deniz Hançer";
  const heroSubtitle = siteSettings?.[`hero_subtitle_${currentLang}`] || t.home?.hero_subtitle || "Güvenilir Hukuki Danışmanlık";
  const heroDescription = siteSettings?.[`hero_description_${currentLang}`] || t.home?.hero_description || "Yıllarca deneyim ile müvekkillerimize en kaliteli hukuki hizmetleri sunuyoruz.";
  
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
          <h1 className="text-6xl font-bold mb-4">{heroTitle}</h1>
          <p className="text-2xl mb-6">{heroSubtitle}</p>
          <p className="text-lg mb-8 max-w-3xl mx-auto">{heroDescription}</p>
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
const About = ({ currentLang, siteSettings }) => {
  const t = translations[currentLang];
  
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-navy-900">{t.about.title}</h2>
        
        <div className="space-y-12">
          {/* Company Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxsYXd5ZXJ8ZW58MHx8fHwxNzU4ODYzMzIxfDA&ixlib=rb-4.1.0&q=85"
                alt="DH Hukuk Bürosu"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-6 text-navy-900">{t.about.company_title}</h3>
              <div className="text-lg text-gray-600 leading-relaxed space-y-4">
                {siteSettings?.[`about_company_${currentLang}`] ? (
                  siteSettings[`about_company_${currentLang}`].split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>DH Hukuk Bürosu, Avukat Deniz HANÇER tarafından kurulmuş olup, İstanbul'da hizmet vermektedir.</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Founder Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-3xl font-bold mb-6 text-navy-900">{t.about.founder_title}</h3>
              <div className="text-lg text-gray-600 leading-relaxed space-y-4">
                {siteSettings?.[`about_founder_${currentLang}`] ? (
                  siteSettings[`about_founder_${currentLang}`].split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>Deniz HANÇER, hukuk fakültesini onur öğrencisi olarak bitirmiştir.</p>
                )}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxsYXd5ZXJ8ZW58MHx8fHwxNzU4ODYzMzIxfDA&ixlib=rb-4.1.0&q=85"
                alt="Av. Deniz Hançer"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Services Component (All 17 Services)
const Services = ({ currentLang }) => {
  const t = translations[currentLang];
  const [flippedCard, setFlippedCard] = useState(null);
  
  const handleCardClick = (serviceId) => {
    setFlippedCard(flippedCard === serviceId ? null : serviceId);
  };

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-navy-900">{t.services.title}</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {servicesData.map((service) => (
            <div 
              key={service.id} 
              className="flip-card h-48 cursor-pointer"
              onClick={() => handleCardClick(service.id)}
            >
              <div className={`flip-card-inner ${flippedCard === service.id ? 'flipped' : ''}`}>
                <div className="flip-card-front">
                  <Card className="h-full flex items-center justify-center p-4 bg-navy-700 text-white">
                    <h3 className="text-lg font-semibold text-center">
                      {service[`title_${currentLang}`]}
                    </h3>
                  </Card>
                </div>
                <div className="flip-card-back">
                  <Card className="h-full p-4 flex flex-col justify-center bg-white">
                    <h4 className="text-md font-semibold mb-3 text-navy-900">
                      {service[`title_${currentLang}`]}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {service[`description_${currentLang}`].substring(0, 120)}...
                    </p>
                  </Card>
                </div>
              </div>
            </div>
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
                  <Link to={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      {t.blog.read_more}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

// Blog Detail Component
const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(() => {
    const saved = localStorage.getItem('preferred-language');
    return saved || detectLanguage();
  });

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API}/blog`);
      const foundPost = response.data.find(p => p.slug === slug);
      setPost(foundPost);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center">Blog yazısı bulunamadı.</div>;
  }

  const t = translations[currentLang];

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button 
          onClick={() => window.close()} 
          variant="outline"
          className="mb-8"
        >
          ← {t.blog.back_to_blog}
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-navy-900">
              {post[`title_${currentLang}`] || post.title_tr}
            </CardTitle>
            <p className="text-gray-500">
              {new Date(post.created_at).toLocaleDateString('tr-TR')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              {(post[`content_${currentLang}`] || post.content_tr).split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
                      {servicesData.map((service) => (
                        <SelectItem key={service.id} value={service.title_tr.toLowerCase().replace(/\s+/g, '_')}>
                          {service[`title_${currentLang}`]}
                        </SelectItem>
                      ))}
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
                <h3 className="text-xl font-semibold mb-4 text-navy-900">{t.contact.contact_info}</h3>
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
            
            <Card>
              <CardHeader>
                <CardTitle>{t.contact.location}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4573.126712381559!2d29.01755120304624!3d41.11314703268643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab5bf89700723%3A0xb746023adab01c47!2s42%20Maslak!5e0!3m2!1str!2str!4v1758735568967!5m2!1str!2str"
                  width="100%" 
                  height="300" 
                  style={{border:0}} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="DH Hukuk Bürosu Konum">
                </iframe>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main Website Component
const MainWebsite = () => {
  const [currentLang, setCurrentLang] = useState(() => {
    const saved = localStorage.getItem('preferred-language');
    return saved || detectLanguage();
  });
  
  const [siteSettings, setSiteSettings] = useState(null);
  
  useEffect(() => {
    localStorage.setItem('preferred-language', currentLang);
    fetchSiteSettings();
  }, [currentLang]);

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSiteSettings(response.data);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };
  
  const handleLanguageChange = (lang) => {
    setCurrentLang(lang);
  };
  
  return (
    <>
      <Navigation currentLang={currentLang} onLanguageChange={handleLanguageChange} siteSettings={siteSettings} />
      
      <Home currentLang={currentLang} siteSettings={siteSettings} />
      <About currentLang={currentLang} siteSettings={siteSettings} />
      <Services currentLang={currentLang} />
      <Blog currentLang={currentLang} />
      <Contact currentLang={currentLang} />
      
      <footer className="bg-navy-900 text-white py-8">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p>&copy; 2024 DH Hukuk Bürosu. Tüm hakları saklıdır.</p>
          <p className="mt-2 text-navy-300">hancer.av.tr</p>
          <small className="text-navy-400">
            Designed by <a href="https://burkutsoft.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 no-underline">burkutsoft.com</a>
          </small>
        </div>
      </footer>
    </>
  );
};

// Password Reset Component
const PasswordReset = () => {
  const [urlParams] = useState(new URLSearchParams(window.location.search));
  const [token] = useState(urlParams.get('token'));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API}/admin/reset-password?token=${token}&new_password=${newPassword}`);
      setMessage('Şifreniz başarıyla değiştirildi! Admin paneline giriş yapabilirsiniz.');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Şifre değiştirme başarısız');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Geçersiz şifre sıfırlama bağlantısı</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-navy-900">
            Şifre Sıfırla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Yeni Şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Yeni Şifre Tekrar"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {message && (
              <p className={`text-sm ${message.includes('başarı') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
            <Button 
              type="submit" 
              className="w-full bg-navy-700 hover:bg-navy-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Şifre Değiştiriliyor..." : "Şifreyi Değiştir"}
            </Button>
            <div className="text-center">
              <Link to="/admin" className="text-navy-700 hover:text-navy-900">
                Admin Paneline Dön
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/reset-password" element={<PasswordReset />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/" element={<MainWebsite />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;