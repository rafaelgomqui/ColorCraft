import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePaletteStore } from '../stores/usePaletteStore';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const { setColors } = usePaletteStore();
  const navigate = useNavigate();
  const [palettes, setPalettes] = useState<any[]>([]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    loadPalettes();
  }, [navigate]);

  const loadPalettes = async () => {
    try {
      const res = await api.get('/palettes');
      if (res.data.success) {
        setPalettes(res.data.palettes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (colors: string[]) => {
    setColors(colors);
    navigate('/');
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('dashboard.confirmDelete'))) return;
    try {
      await api.delete(`/palettes/${id}`);
      loadPalettes();
    } catch (err) {
      alert(t('dashboard.deleteError'));
    }
  };

  return (
    <div className="flex-1 max-w-screen-2xl mx-auto w-full p-6">
      <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {palettes.map(palette => (
          <div key={palette.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h3 className="font-bold text-xl mb-1 text-zinc-900 dark:text-white truncate">{palette.name}</h3>
            {palette.notes ? (
               <p className="text-sm text-zinc-500 mb-4 h-5 overflow-hidden text-ellipsis whitespace-nowrap">{palette.notes}</p>
            ) : (
               <div className="h-5 mb-4"></div>
            )}
            <div className="flex w-full h-16 rounded-xl overflow-hidden mb-4 shadow-inner">
              {palette.colors.map((color: string, i: number) => (
                <div key={i} style={{ backgroundColor: color }} className="flex-1 h-full" title={color} />
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span className="font-medium">{new Date(palette.createdAt).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(palette.colors)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition" title={t('dashboard.editInEditor')}>
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(palette.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" title={t('dashboard.delete')}>
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {palettes.length === 0 && (
           <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
             <p className="text-zinc-500 mb-4">{t('dashboard.empty')}</p>
             <button onClick={() => navigate('/')} className="bg-indigo-500 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-600 transition">
               {t('dashboard.createFirst')}
             </button>
           </div>
        )}
      </div>
    </div>
  );
}