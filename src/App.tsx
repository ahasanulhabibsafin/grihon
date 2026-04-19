/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Plus, X, Image as ImageIcon, Github, Search, Heart, User, Lock, LogOut } from 'lucide-react';

const ADMIN_CREDENTIALS = {
  email: 'GRIHONGALLERY013@safincom',
  password: 'QAXWSZSAFIN'
};

interface ImageItem {
  id: string;
  url: string;
  timestamp: number;
}

const DEFAULT_IMAGES: ImageItem[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000', timestamp: Date.now() },
  { id: '2', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1000', timestamp: Date.now() - 1000 },
  { id: '3', url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=1000', timestamp: Date.now() - 2000 },
  { id: '4', url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=1000', timestamp: Date.now() - 3000 },
  { id: '5', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1000', timestamp: Date.now() - 4000 },
  { id: '6', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1000', timestamp: Date.now() - 5000 },
];

export default function App() {
  const [activePage, setActivePage] = useState<'HOME' | 'VISUALS' | 'DOWNLOADS'>('HOME');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('grihon_images');
    if (saved) {
      setImages(JSON.parse(saved));
    } else {
      setImages(DEFAULT_IMAGES);
    }
    
    const savedDownloads = localStorage.getItem('grihon_downloads');
    if (savedDownloads) {
      setDownloadHistory(JSON.parse(savedDownloads));
    }
    
    const adminStatus = localStorage.getItem('grihon_admin');
    const userStatus = localStorage.getItem('grihon_user');
    
    if (adminStatus === 'true') {
      setIsAdmin(true);
      setCurrentUser(ADMIN_CREDENTIALS.email);
    } else if (userStatus) {
      setCurrentUser(userStatus);
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('grihon_images', JSON.stringify(images));
      localStorage.setItem('grihon_downloads', JSON.stringify(downloadHistory));
    }
  }, [images, downloadHistory, isLoading]);

  const handleAddImage = (e: FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    const newImage: ImageItem = {
      id: Math.random().toString(36).substr(2, 9),
      url: newImageUrl.trim(),
      timestamp: Date.now(),
    };

    setImages([newImage, ...images]);
    setNewImageUrl('');
    setIsModalOpen(false);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: ImageItem = {
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string,
          timestamp: Date.now(),
        };
        setImages([newImage, ...images]);
        setIsModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (loginEmail === ADMIN_CREDENTIALS.email && loginPassword === ADMIN_CREDENTIALS.password) {
      setIsAdmin(true);
      setCurrentUser(loginEmail);
      localStorage.setItem('grihon_admin', 'true');
      localStorage.removeItem('grihon_user');
    } else {
      setIsAdmin(false);
      setCurrentUser(loginEmail);
      localStorage.setItem('grihon_user', loginEmail);
      localStorage.removeItem('grihon_admin');
    }
    setIsLoginModalOpen(false);
    setLoginEmail('');
    setLoginPassword('');
    setError('');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    localStorage.removeItem('grihon_admin');
    localStorage.removeItem('grihon_user');
  };

  const handleDownload = async (url: string, id: string) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    if (downloadHistory.length >= 10 && !isAdmin) {
      setError('Download limit reached (Max 10).');
      setIsLoginModalOpen(true); // Reuse modal to show error/limit
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `grihon-image-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Auto-remove and add to history (UI handled via filters)
      if (!isAdmin) {
        if (!downloadHistory.includes(id)) {
          setDownloadHistory(prev => [id, ...prev]);
        }
      }
    } catch (error) {
      console.error('Failed to download image:', error);
      window.open(url, '_blank');
    }
  };

  const deleteImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
    setDownloadHistory(downloadHistory.filter(dId => dId !== id));
  };

  const renderHome = () => (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="nike-container">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="uppercase text-sm font-bold tracking-widest text-[#707072]">Digital Archives</span>
              {isAdmin && <div className="h-1 w-12 bg-black" />}
            </div>
            <h2 className="hero-text">GRIHON<br/>GALLERY</h2>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-6">
              <p className="max-w-xl text-lg text-[#707072]">
                Your personal vault for high-performance visual references. 
                Upload links for instant curation, download for free, and inspire your next creative breakthrough.
              </p>
              <div className="flex gap-4">
                {isAdmin ? (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                    Manage Archive
                  </button>
                ) : (
                  <button 
                    onClick={() => setActivePage('VISUALS')}
                    className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all font-sans"
                  >
                    Explore Gallery
                  </button>
                )}
                <button className="border-2 border-gray-200 px-8 py-3 rounded-full font-bold hover:border-black transition-all font-sans">
                  Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="pb-32">
        <div className="nike-container">
          <div className="flex justify-between items-end mb-10">
            <h3 className="text-4xl font-black tracking-tighter">LATEST DROPS</h3>
            <button 
              onClick={() => setActivePage('VISUALS')}
              className="font-bold underline underline-offset-8 hover:text-gray-500 transition-colors"
            >
              Shop All Visuals
            </button>
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {images
                .filter(img => !downloadHistory.includes(img.id))
                .slice(0, 6)
                .map((img) => (
                  <div key={img.id} className="break-inside-avoid">
                    <ImageCard img={img} isAdmin={isAdmin} onDelete={deleteImage} onDownload={handleDownload} />
                  </div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );

  const renderVisuals = () => {
    // Filter out images that have been downloaded by the user
    const availableImages = images.filter(img => !downloadHistory.includes(img.id));

    return (
      <div className="pt-32 pb-32">
        <div className="nike-container">
          <div className="flex flex-col gap-6 mb-12">
            <h2 className="text-6xl font-black tracking-tighter uppercase">VISUAL ARCHIVE</h2>
            <div className="flex gap-8 border-b border-gray-100 pb-4 overflow-x-auto whitespace-nowrap">
              <button className="font-bold border-b-2 border-black pb-4 -mb-[18px]">Available ({availableImages.length})</button>
              <button className="font-bold text-[#707072] hover:text-black transition-colors">Trending</button>
              <button className="font-bold text-[#707072] hover:text-black transition-colors">Photography</button>
            </div>
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {availableImages.map((img) => (
                <div key={img.id} className="break-inside-avoid">
                  <ImageCard img={img} isAdmin={isAdmin} onDelete={deleteImage} onDownload={handleDownload} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  const renderDownloads = () => {
    const downloadedImages = images.filter(img => downloadHistory.includes(img.id));
    
    return (
      <div className="pt-32 pb-32 min-h-screen">
        <div className="nike-container">
          <div className="flex flex-col gap-6 mb-12">
            <h2 className="text-6xl font-black tracking-tighter uppercase">YOUR DOWNLOADS</h2>
            <p className="text-[#707072] text-lg font-sans">
              Collection of visuals you've authenticated for your creative workspace.
            </p>
          </div>
          
          {downloadedImages.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              <AnimatePresence mode="popLayout">
                {downloadedImages.map((img) => (
                  <div key={img.id} className="break-inside-avoid">
                    <ImageCard img={img} isAdmin={isAdmin} onDelete={deleteImage} onDownload={handleDownload} />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
              <Download className="w-12 h-12 mx-auto text-gray-300 mb-6" />
              <h3 className="text-2xl font-bold mb-2">No downloads yet</h3>
              <p className="text-gray-500 mb-8">Start exploring the gallery to build your personal archive.</p>
              <button 
                onClick={() => setActivePage('VISUALS')}
                className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all font-sans"
              >
                Go to Visuals
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen selection:bg-black selection:text-white">
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 font-sans">
        <div className="nike-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 
              className="text-2xl font-black tracking-tighter cursor-pointer" 
              onClick={() => { setActivePage('HOME'); window.scrollTo({top:0, behavior:'smooth'}); }}
            >
              GRIHON
            </h1>
            <div className="hidden md:flex gap-6 font-bold text-sm uppercase items-center">
              <button 
                onClick={() => setActivePage('VISUALS')}
                className={`transition-colors ${activePage === 'VISUALS' ? 'text-black' : 'text-[#707072] hover:text-black'}`}
              >
                Visuals
              </button>
              <button 
                onClick={() => setActivePage('DOWNLOADS')}
                className={`transition-colors ${activePage === 'DOWNLOADS' ? 'text-black' : 'text-[#707072] hover:text-black'}`}
              >
                Downloads
              </button>
              {isAdmin && <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded tracking-widest font-black">ADMIN MODE</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-1.5 focus-within:bg-gray-200 transition-colors group">
              <Search className="w-4 h-4 text-gray-400 group-focus-within:text-black" />
              <input 
                type="text" 
                placeholder="Search gallery" 
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48 outline-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-tighter leading-none">
                  {currentUser ? (isAdmin ? 'Admin' : 'Member') : 'Guest'}
                </span>
                {currentUser && !isAdmin && (
                  <span className={`text-[10px] font-bold ${downloadHistory.length >= 10 ? 'text-red-500' : 'text-gray-400'}`}>
                    Quota: {downloadHistory.length}/10
                  </span>
                )}
              </div>
              {currentUser ? (
                <button 
                  onClick={handleLogout}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <User className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {activePage === 'HOME' && renderHome()}
        {activePage === 'VISUALS' && renderVisuals()}
        {activePage === 'DOWNLOADS' && renderDownloads()}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white pt-20 pb-10">
        <div className="nike-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-black tracking-tighter mb-4">GRIHON®</h4>
              <button onClick={() => setActivePage('HOME')} className="text-xs uppercase font-bold text-left hover:text-gray-400">Home</button>
              <button onClick={() => setActivePage('VISUALS')} className="text-xs uppercase font-bold text-left hover:text-gray-400">Visuals</button>
              <button onClick={() => setActivePage('DOWNLOADS')} className="text-xs uppercase font-bold text-left hover:text-gray-400">Downloads</button>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase mb-4 tracking-widest text-gray-500">Support</h4>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Submission Guide</a>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Quality Standards</a>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Contact Support</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase mb-4 tracking-widest text-gray-500">Company</h4>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">About Us</a>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Visual Mission</a>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Sustainability</a>
            </div>
            <div className="flex gap-6">
              <Github className="w-5 h-5 cursor-pointer hover:opacity-50 transition-opacity" />
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full" />
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase font-bold">Global Archive</span>
              <p className="text-[10px] text-gray-500">© 2026 Grihon visuals. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[10px] text-gray-500 uppercase font-bold whitespace-nowrap">
              <a href="#" className="hover:text-white transition-colors">Guides</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Sale</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals remain the same */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-10 md:p-14">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-3xl font-black tracking-tighter">ADD TO ARCHIVE</h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#707072]">Option 1: Upload File (Actual Size)</label>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl hover:bg-gray-50 hover:border-black transition-all cursor-pointer">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Plus className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Visual Asset</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase font-black text-gray-300">
                        <span className="bg-white px-4">OR</span>
                      </div>
                    </div>

                    <form onSubmit={handleAddImage} className="flex flex-col gap-6">
                      <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#707072]">Option 2: Direct Link</label>
                        <div className="flex items-center gap-4 border-b-2 border-black py-4 focus-within:border-[#707072] transition-colors">
                          <ImageIcon className="w-6 h-6 text-black" />
                          <input 
                            type="url" 
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Paste source link..." 
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold outline-none placeholder:text-gray-300"
                          />
                        </div>
                      </div>
                      
                      <button 
                        type="submit"
                        className="w-full bg-black text-white py-5 rounded-full font-black hover:bg-gray-800 transition-all text-sm tracking-widest uppercase"
                      >
                        DEPLOY TO GALLERY
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin/User Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-black/99 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl p-10"
            >
              <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black tracking-tighter uppercase">{error ? 'Archive Limit' : 'Member Access'}</h3>
                  <button onClick={() => setIsLoginModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                  {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest bg-red-50 p-4 rounded-2xl border border-red-100 leading-relaxed font-sans">{error}</p>}
                  
                  {!error && (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#707072]">Identity (Email)</label>
                        <input 
                          type="email" 
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="Your Archive ID" 
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#707072]">Access Key</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Password" 
                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                            required
                          />
                          <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-black text-white py-5 rounded-full font-black hover:bg-gray-800 transition-all text-sm tracking-widest uppercase mt-4"
                      >
                        AUTHENTICATE
                      </button>
                    </>
                  )}

                  {error && (
                    <button 
                      onClick={() => { setError(''); setIsLoginModalOpen(false); }}
                      className="w-full bg-black text-white py-5 rounded-full font-black hover:bg-gray-800 transition-all text-sm tracking-widest uppercase mt-4"
                    >
                      Return to Archive
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImageCard({ img, isAdmin, onDelete, onDownload }: { 
  img: ImageItem, 
  isAdmin: boolean, 
  onDelete: (id: string) => void, 
  onDownload: (url: string, id: string) => Promise<void> | void,
  key?: string | number
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.165, 0.84, 0.44, 1] }}
      className="group relative bg-[#F1F1F1] overflow-hidden cursor-pointer image-card-hover rounded-xl"
    >
      <img 
        src={img.url} 
        alt="Gallery" 
        className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
        {isAdmin && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(img.id);
            }}
            className="absolute top-6 right-6 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-red-500 transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex justify-between items-end">
          <div className="text-white drop-shadow-md">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Authenticated</p>
            <p className="text-sm font-bold">ARC-{img.id.toUpperCase()}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDownload(img.url, img.id);
            }}
            className="download-btn flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </motion.div>
  );
}
