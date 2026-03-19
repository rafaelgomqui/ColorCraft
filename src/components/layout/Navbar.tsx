import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/useAuthStore';
import { Palette, LogOut, Sun, Moon, Languages } from 'lucide-react';
import { useEffect, useState } from 'react';
import i18n from '../../i18n';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-zinc-200 dark:border-zinc-800">
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Palette className="w-6 h-6 text-indigo-500" />
          <span>ColorCraft</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" title={i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}>
            <Languages className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            {isDark ? <Sun className="w-5 h-5 text-zinc-300" /> : <Moon className="w-5 h-5 text-zinc-600" />}
          </button>
          
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-sm font-medium text-indigo-500 hover:text-indigo-600 transition tracking-wide hidden sm:block mr-2">
                 {t('nav.myPalettes')}
              </Link>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{user.nombre}</span>
              <button 
                onClick={logout}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition">
                {t('auth.login')}
              </Link>
              <Link to="/register" className="text-sm font-medium bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition">
                {t('auth.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
