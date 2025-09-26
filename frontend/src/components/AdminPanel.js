import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Admin Setup Component
const AdminSetup = ({ onSetupComplete }) => {
  const [setupData, setSetupData] = useState({
    username: "deniz@hancer.av.tr",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (setupData.password !== setupData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    
    if (setupData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await axios.post(`${API}/admin/setup`, {
        username: setupData.username,
        password: setupData.password
      });
      
      alert("Admin hesabı başarıyla oluşturuldu!");
      onSetupComplete(setupData.username, setupData.password);
    } catch (error) {
      console.error("Admin setup error:", error);
      setError(error.response?.data?.detail || "Hesap oluşturulurken hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-navy-900">
            Admin Hesabı Kurulumu
          </CardTitle>
          <p className="text-center text-gray-600">
            İlk kez giriş yapıyorsunuz. Lütfen şifrenizi belirleyin.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Kullanıcı Adı (Email)"
              value={setupData.username}
              onChange={(e) => setSetupData(prev => ({ ...prev, username: e.target.value }))}
              required
              disabled
            />
            <Input
              type="password"
              placeholder="Şifre"
              value={setupData.password}
              onChange={(e) => setSetupData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <Input
              type="password"
              placeholder="Şifre Tekrar"
              value={setupData.confirmPassword}
              onChange={(e) => setSetupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full bg-navy-700 hover:bg-navy-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Oluşturuluyor..." : "Admin Hesabı Oluştur"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Login Component
const AdminLogin = ({ onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({
    username: "deniz@hancer.av.tr",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await axios.post(`${API}/admin/login`, {
        username: loginData.username,
        password: loginData.password
      });
      
      onLoginSuccess();
    } catch (error) {
      console.error("Login error:", error);
      setError("Geçersiz kullanıcı adı veya şifre");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-navy-900">
            Admin Girişi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Kullanıcı Adı"
              value={loginData.username}
              onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
              required
              disabled
            />
            <Input
              type="password"
              placeholder="Şifre"
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full bg-navy-700 hover:bg-navy-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Messages Management Component
const MessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm("Bu mesajı silmek istediğinizden emin misiniz?")) return;

    try {
      await axios.delete(`${API}/messages/${messageId}`);
      setMessages(messages.filter(msg => msg.id !== messageId));
      alert("Mesaj başarıyla silindi!");
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Mesaj silinirken hata oluştu");
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`${API}/messages/${messageId}/read`);
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLegalAreaText = (area) => {
    const areas = {
      family_law: "Aile Hukuku",
      commercial_law: "Ticaret Hukuku",
      criminal_law: "Ceza Hukuku",
      labor_law: "İş Hukuku",
      real_estate: "Gayrimenkul Hukuku",
      contract_law: "Sözleşme Hukuku",
      other: "Diğer"
    };
    return areas[area] || area;
  };

  if (loading) {
    return <div className="text-center py-8">Mesajlar yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-navy-900">Gelen Mesajlar ({messages.length})</h3>
      
      {messages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Henüz mesaj bulunmuyor.
          </CardContent>
        </Card>
      ) : (
        messages.map((message) => (
          <Card key={message.id} className={`${!message.is_read ? 'border-navy-300 bg-navy-50' : ''}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-navy-900">{message.name}</h4>
                  <p className="text-gray-600">{message.email} • {message.phone}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(message.created_at).toLocaleDateString('tr-TR')} {new Date(message.created_at).toLocaleTimeString('tr-TR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getUrgencyColor(message.urgency)}>
                    {message.urgency.toUpperCase()}
                  </Badge>
                  {!message.is_read && (
                    <Badge className="bg-blue-100 text-blue-800">YENİ</Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p><strong>Konu:</strong> {message.subject}</p>
                <p><strong>Hukuki Alan:</strong> {getLegalAreaText(message.legal_area)}</p>
                <p><strong>Mesaj:</strong></p>
                <p className="bg-gray-50 p-3 rounded">{message.message}</p>
              </div>
              
              <div className="flex space-x-2">
                {!message.is_read && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => markAsRead(message.id)}
                  >
                    Okundu İşaretle
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => deleteMessage(message.id)}
                >
                  Sil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

// Site Settings Manager Component
const SiteSettingsManager = () => {
  const [settings, setSettings] = useState({
    logo_url: "",
    about_company: "",
    about_founder: ""
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings({
        logo_url: response.data.logo_url,
        about_company: response.data.about_company,
        about_founder: response.data.about_founder
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.put(`${API}/settings`, settings);
      alert("Site ayarları başarıyla güncellendi!");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Ayarlar güncellenirken hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="text-center py-8">Ayarlar yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-navy-900">Site Ayarları</h3>
      
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Logo URL</label>
              <Input
                placeholder="https://example.com/logo.png"
                value={settings.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">Logo görsel URL'sini buraya girin</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Hakkımızda - Şirket Bilgileri</label>
              <Textarea
                placeholder="DH Hukuk Bürosu hakkında bilgiler..."
                value={settings.about_company}
                onChange={(e) => handleChange('about_company', e.target.value)}
                rows="8"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Hakkımızda - Kurucu Bilgileri</label>
              <Textarea
                placeholder="Av. Deniz Hançer hakkında bilgiler..."
                value={settings.about_founder}
                onChange={(e) => handleChange('about_founder', e.target.value)}
                rows="8"
              />
            </div>
            
            <Button 
              type="submit" 
              className="bg-navy-700 hover:bg-navy-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Güncelleniyor..." : "Ayarları Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Blog Manager Component
const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title_tr: "", title_en: "", title_de: "", title_ru: "",
    content_tr: "", content_en: "", content_de: "", content_ru: "",
    slug: "", published: true
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog?published_only=false`);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title_tr: "", title_en: "", title_de: "", title_ru: "",
      content_tr: "", content_en: "", content_de: "", content_ru: "",
      slug: "", published: true
    });
    setIsCreating(false);
    setEditingPost(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPost) {
        await axios.put(`${API}/blog/${editingPost.id}`, formData);
        alert("Blog yazısı başarıyla güncellendi!");
      } else {
        await axios.post(`${API}/blog`, formData);
        alert("Blog yazısı başarıyla oluşturuldu!");
      }
      
      fetchPosts();
      resetForm();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Blog yazısı kaydedilirken hata oluştu");
    }
  };

  const deletePost = async (postId) => {
    if (!confirm("Bu blog yazısını silmek istediğinizden emin misiniz?")) return;

    try {
      await axios.delete(`${API}/blog/${postId}`);
      setPosts(posts.filter(post => post.id !== postId));
      alert("Blog yazısı başarıyla silindi!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Blog yazısı silinirken hata oluştu");
    }
  };

  const startEditing = (post) => {
    setFormData({
      title_tr: post.title_tr,
      title_en: post.title_en,
      title_de: post.title_de,
      title_ru: post.title_ru,
      content_tr: post.content_tr,
      content_en: post.content_en,
      content_de: post.content_de,
      content_ru: post.content_ru,
      slug: post.slug,
      published: post.published
    });
    setEditingPost(post);
    setIsCreating(true);
  };

  if (loading) {
    return <div className="text-center py-8">Blog yazıları yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-navy-900">Blog Yönetimi</h3>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-navy-700 hover:bg-navy-800"
        >
          Yeni Blog Yazısı
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPost ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı Oluştur"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Başlık (Türkçe)"
                  value={formData.title_tr}
                  onChange={(e) => setFormData({...formData, title_tr: e.target.value})}
                  required
                />
                <Input
                  placeholder="Title (English)"
                  value={formData.title_en}
                  onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                  required
                />
                <Input
                  placeholder="Titel (Deutsch)"
                  value={formData.title_de}
                  onChange={(e) => setFormData({...formData, title_de: e.target.value})}
                  required
                />
                <Input
                  placeholder="Заголовок (Русский)"
                  value={formData.title_ru}
                  onChange={(e) => setFormData({...formData, title_ru: e.target.value})}
                  required
                />
              </div>
              
              <Input
                placeholder="URL Slug (örn: yeni-blog-yazisi)"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                required
              />

              <div className="grid grid-cols-1 gap-4">
                <Textarea
                  placeholder="İçerik (Türkçe)"
                  value={formData.content_tr}
                  onChange={(e) => setFormData({...formData, content_tr: e.target.value})}
                  rows="6"
                  required
                />
                <Textarea
                  placeholder="Content (English)"
                  value={formData.content_en}
                  onChange={(e) => setFormData({...formData, content_en: e.target.value})}
                  rows="6"
                  required
                />
                <Textarea
                  placeholder="Inhalt (Deutsch)"
                  value={formData.content_de}
                  onChange={(e) => setFormData({...formData, content_de: e.target.value})}
                  rows="6"
                  required
                />
                <Textarea
                  placeholder="Содержание (Русский)"
                  value={formData.content_ru}
                  onChange={(e) => setFormData({...formData, content_ru: e.target.value})}
                  rows="6"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({...formData, published: e.target.checked})}
                />
                <label htmlFor="published">Yayınla</label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="bg-navy-700 hover:bg-navy-800">
                  {editingPost ? "Güncelle" : "Oluştur"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Henüz blog yazısı bulunmuyor.
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-navy-900">{post.title_tr}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('tr-TR')}
                      {post.updated_at !== post.created_at && 
                        ` (Güncellendi: ${new Date(post.updated_at).toLocaleDateString('tr-TR')})`
                      }
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={post.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {post.published ? "Yayında" : "Taslak"}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.content_tr.substring(0, 200)}...
                </p>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => startEditing(post)}>
                    Düzenle
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deletePost(post.id)}>
                    Sil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Main Admin Panel Component
const AdminPanel = () => {
  const [hasAdmin, setHasAdmin] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminSetup();
  }, []);

  const checkAdminSetup = async () => {
    try {
      const response = await axios.get(`${API}/admin/check-setup`);
      setHasAdmin(response.data.has_admin);
    } catch (error) {
      console.error("Error checking admin setup:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = (username, password) => {
    setHasAdmin(true);
    setIsLoggedIn(true);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (!hasAdmin) {
    return <AdminSetup onSetupComplete={handleSetupComplete} />;
  }

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-navy-900">Admin Paneli - Av. Deniz Hançer</h1>
          <Button variant="outline" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages">Mesajlar</TabsTrigger>
            <TabsTrigger value="blog">Blog Yönetimi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="mt-6">
            <MessagesManager />
          </TabsContent>
          
          <TabsContent value="blog" className="mt-6">
            <BlogManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;