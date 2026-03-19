import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Moon, 
  Sun, 
  User, 
  Palette,
  LogOut,
  Globe
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';

type Language = 'es' | 'en';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Inicializar el estado directamente desde localStorage
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark';
    }
    return false;
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language | null;
      return savedLang || 'es';
    }
    return 'es';
  });
  
  const { user, logout } = useAuth();

  // Efecto solo para actualizar la clase del documento
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    
    if (newDarkMode) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = () => {
    const newLang: Language = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleLogout = () => {
    logout();
  };

  const texts = {
    es: {
      savedDesigns: 'Diseños Guardados',
      myPalettes: 'Mis Paletas',
      settings: 'Configuración',
      logout: 'Cerrar Sesión',
      login: 'Iniciar Sesión',
      rights: '© 2024 ColorCraft. Todos los derechos reservados.'
    },
    en: {
      savedDesigns: 'Saved Designs',
      myPalettes: 'My Palettes',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login',
      rights: '© 2024 ColorCraft. All rights reserved.'
    }
  };

  const t = texts[language];

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-500 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-yellow-300/20 via-transparent to-cyan-300/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-300/30 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-30px, 30px) rotate(-120deg); }
          66% { transform: translate(20px, -20px) rotate(-240deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="relative z-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-xl">
            <div className="flex items-center justify-between p-4">
              {/* Left side - Menu */}
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 text-white font-semibold">
                  <Palette className="w-6 h-6" />
                  <span className="text-lg">ColorCraft</span>
                </Link>
              </div>

              {/* Right side - Controls */}
              <div className="flex items-center gap-2">
                {/* Language Toggle */}
                <button 
                  onClick={toggleLanguage}
                  className="text-white hover:bg-white/10 gap-2 flex items-center px-3 py-2 rounded-md transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {language === 'es' ? '🇪🇸' : '🇬🇧'}
                </button>

                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className="text-white hover:bg-white/10 p-2 rounded-md transition-colors"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* User Menu */}
                {user ? (
                  <div className="relative group">
                    <button className="text-white hover:bg-white/10 p-2 rounded-md transition-colors">
                      <User className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/20 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="flex items-center gap-2 px-4 py-2 text-sm">
                        <User className="w-4 h-4" />
                        {user.nombre}
                      </div>
                      <div className="border-t border-white/20 my-1"></div>
                      <Link 
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <Palette className="w-4 h-4" />
                        {t.myPalettes}
                      </Link>
                      <div className="border-t border-white/20 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 w-full text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t.logout}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
                  >
                    {t.login}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-20 mt-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-xl">
            <div className="p-6 text-center">
              <p className="text-white/80 text-sm">
                {t.rights}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}