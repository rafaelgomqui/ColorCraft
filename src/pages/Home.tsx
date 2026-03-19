import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePaletteStore } from '../stores/usePaletteStore';
import { useAuthStore } from '../stores/useAuthStore';
import { Link } from 'react-router-dom';
import ColorWheel from '../components/editor/ColorWheel';
import api from '../api/client';
import { Bot, Save, Maximize2 } from 'lucide-react';
import { getColorFormats } from '../utils/colors';

export default function Home() {
  const { t } = useTranslation();
  const { colors, updateColor, setColors } = usePaletteStore();
  const { user } = useAuthStore();
  
  const [prompt, setPrompt] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paletteName, setPaletteName] = useState('');
  const [paletteNotes, setPaletteNotes] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoadingAI(true);
    try {
      const res = await api.post('/ai/generate', { prompt });
      if (res.data.success) {
        setColors(res.data.colors);
      }
    } catch (err: any) {
      console.error(err);
      alert(t('home.alertAiError') + ': ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert(t('home.alertLoginRequired'));
      return;
    }
    if (!paletteName.trim()) {
      alert(t('home.alertNameRequired'));
      return;
    }
    setSaving(true);
    try {
      await api.post('/palettes', {
        name: paletteName.trim(),
        notes: paletteNotes.trim(),
        colors,
        format: 'HEX'
      });
      alert(t('home.alertSaveSuccess'));
      setPaletteName('');
      setPaletteNotes('');
    } catch (err) {
      alert(t('home.alertSaveError'));
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full bg-[#f3f4f6] dark:bg-[#121212]">
      
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-screen-2xl mx-auto p-4 md:p-8 gap-8 items-start justify-center">
        
        {/* IA Sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-4 order-2 md:order-1 shrink-0">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-zinc-800 dark:text-zinc-200">
               <Bot className="w-5 h-5 text-indigo-500"/> {t('home.aiTitle')}
            </h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              {t('home.aiDesc')}
            </p>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('home.aiPlaceholder')}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button 
                 onClick={handleGenerate} 
                 disabled={loadingAI || !prompt.trim()}
                 className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 font-medium text-white px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                 {loadingAI ? t('home.aiGenerating') : t('home.aiButton')}
              </button>
            </div>
          </div>
        </div>

        {/* Color Wheel */}
        <div className="flex-1 w-full flex justify-center order-1 md:order-2">
           <ColorWheel />
        </div>

        {/* Save Sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-4 order-3 shrink-0">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                 <Save className="w-5 h-5 text-green-500"/> {t('home.saveTitle')}
              </h3>
            </div>
            
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder={t('home.savePlaceholderTitle')}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <textarea 
                value={paletteNotes}
                onChange={(e) => setPaletteNotes(e.target.value)}
                placeholder={t('home.savePlaceholderDesc')}
                rows={2}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
              <button 
                 onClick={handleSave} 
                 disabled={saving || !paletteName.trim()}
                 className="bg-black dark:bg-white text-white dark:text-black font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center disabled:opacity-50 hover:opacity-80 mt-2"
              >
                 {saving ? t('home.saving') : t('home.saveButton')}
              </button>

              <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-2"></div>
              
              <Link to="/preview" className="flex items-center justify-center gap-2 font-medium text-indigo-500 hover:text-indigo-600 transition p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-sm">
                <Maximize2 className="w-4 h-4"/> {t('home.viewLanding')}
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Color Strip */}
      <div className="w-full h-64 md:h-80 flex shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        {colors.map((color, i) => {
          const formats = getColorFormats(color);
          const hexNum = parseInt(color.replace('#', ''), 16);
          const r = (hexNum >> 16) & 255;
          const g = (hexNum >> 8) & 255;
          const b = hexNum & 255;
          const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const textColor = luma < 140 ? 'text-white' : 'text-black';
          
          return (
            <div 
              key={i} 
              className="flex-1 h-full relative group transition-all duration-300 border-r border-black/5 dark:border-white/5 last:border-r-0 hover:flex-[1.5]"
              style={{ backgroundColor: color }}
            >
              <input 
                type="color" 
                value={color}
                onChange={(e) => updateColor(i, e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className={`absolute bottom-0 w-full p-4 flex flex-col items-center justify-end pointer-events-none transition-opacity ${textColor} opacity-0 group-hover:opacity-100`}>
                 <button 
                   onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyToClipboard(formats.hex); }}
                   className={`font-mono text-xl md:text-2xl font-bold tracking-wider mb-2 pointer-events-auto hover:scale-110 active:scale-95 transition-transform drop-shadow-md`}
                   title={t('home.copyHex')}
                 >
                    {formats.hex.toUpperCase()}
                 </button>
                 <div className="flex gap-4 md:gap-6 font-mono text-[10px] md:text-xs font-semibold opacity-80 uppercase tracking-widest drop-shadow">
                    <span>{formats.rgb}</span>
                    <span className="hidden md:inline">{formats.hsb}</span>
                 </div>
              </div>
              
              <div className={`absolute bottom-6 w-full text-center group-hover:hidden transition-opacity ${textColor}`}>
                 <span className="font-mono text-sm md:text-lg font-bold tracking-widest opacity-90 drop-shadow-sm">
                   {formats.hex.toUpperCase()}
                 </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
