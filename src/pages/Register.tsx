import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nombre: '', correo: '', usuario: '', contraseña: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('auth.register')}</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('auth.realName')}</label>
            <input type="text" name="nombre" onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('auth.email')}</label>
            <input type="email" name="correo" onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('auth.usernameLabel')}</label>
            <input type="text" name="usuario" onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('auth.password')}</label>
            <input type="password" name="contraseña" onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <button type="submit" className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition">
            {t('auth.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}