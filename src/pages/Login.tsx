import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { useAuthStore } from '../stores/useAuthStore';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContrasena] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const res = await api.post('/auth/login', { usuario, contraseña });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error login');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('auth.login')}</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('auth.username')}</label>
            <input 
              type="text" 
              value={usuario} 
              onChange={e => setUsuario(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('auth.password')}</label>
            <input 
               type="password" 
               value={contraseña} 
               onChange={e => setContrasena(e.target.value)}
               className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
               required 
            />
          </div>
          <button type="submit" className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition">
            {t('auth.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}