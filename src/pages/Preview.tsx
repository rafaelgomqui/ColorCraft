import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePaletteStore } from '../stores/usePaletteStore';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutTemplate, Palette, Zap, Shield, ArrowRight } from 'lucide-react';

function MappingControl({ title, active, setter, colors }: { title: string, active: number, setter: (i: number) => void, colors: string[] }) {
  return (
    <div className="flex flex-col gap-3">
       <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center justify-between">
          {title}
          <span className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: colors[active] }}></span>
       </span>
       <div className="flex gap-2 justify-between">
          {colors.map((c, i) => (
             <button 
               key={i} 
               onClick={() => setter(i)}
               className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${active === i ? 'scale-110 border-indigo-500 shadow-md ring-2 ring-indigo-500/30' : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'}`}
               style={{ backgroundColor: c }}
               title={`Color ${i+1}`}
             />
          ))}
       </div>
    </div>
  )
}

export default function Preview() {
  const { t } = useTranslation();
  const { colors } = usePaletteStore();

  const [bgIndex, setBgIndex] = useState(0); 
  const [textIndex, setTextIndex] = useState(5); 
  const [primaryIndex, setPrimaryIndex] = useState(1); 
  const [secondaryIndex, setSecondaryIndex] = useState(2); 
  const [accentIndex, setAccentIndex] = useState(3); 
  
  const customStyles = {
    '--color-bg': colors[bgIndex],
    '--color-text': colors[textIndex],
    '--color-primary': colors[primaryIndex],
    '--color-secondary': colors[secondaryIndex],
    '--color-accent': colors[accentIndex],
  } as React.CSSProperties;

  return (
    <div className="relative min-h-screen w-full flex bg-zinc-100 dark:bg-zinc-950 transition-colors duration-500">
      
      {/* Sidebar */}
      <div className="w-80 h-screen sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-50 overflow-y-auto">
         <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <Link to="/" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-400 transition mb-6">
               <ArrowLeft className="w-5 h-5"/> {t('preview.backToEditor')}
            </Link>
            <div className="flex items-center gap-3">
               <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 rounded-2xl text-indigo-500">
                  <Palette className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-xl font-bold dark:text-white leading-tight">{t('preview.themeMapping')}</h2>
                  <p className="text-xs text-zinc-500">{t('preview.themeMappingDesc')}</p>
               </div>
            </div>
         </div>

         <div className="flex-1 p-6 flex flex-col gap-8">
           <MappingControl title={t('preview.mapBackground')} active={bgIndex} setter={setBgIndex} colors={colors} />
           <MappingControl title={t('preview.mapHeadings')} active={textIndex} setter={setTextIndex} colors={colors} />
           <MappingControl title={t('preview.mapParagraphs')} active={accentIndex} setter={setAccentIndex} colors={colors} />
           <MappingControl title={t('preview.mapPrimary')} active={primaryIndex} setter={setPrimaryIndex} colors={colors} />
           <MappingControl title={t('preview.mapBorders')} active={secondaryIndex} setter={setSecondaryIndex} colors={colors} />
         </div>
      </div>

      {/* Dynamic Environment */}
      <div className="flex-1 min-h-screen relative overflow-hidden" style={{ ...customStyles, backgroundColor: 'var(--color-bg)', transition: 'background-color 0.5s ease' }}>
         
         {/* Simulated Navbar */}
         <nav className="w-full h-20 px-10 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-secondary)' }}>
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter" style={{ color: 'var(--color-text)' }}>
               <Zap style={{ color: 'var(--color-primary)' }}/> BRAND.IO
            </div>
            <div className="hidden md:flex gap-8 font-medium text-sm" style={{ color: 'var(--color-accent)' }}>
               <a href="#" className="hover:opacity-60 transition">{t('preview.navHome')}</a>
               <a href="#" className="hover:opacity-60 transition">{t('preview.navFeatures')}</a>
               <a href="#" className="hover:opacity-60 transition">{t('preview.navPricing')}</a>
               <a href="#" className="hover:opacity-60 transition">{t('preview.navAbout')}</a>
            </div>
            <button className="px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
               {t('preview.getStarted')}
            </button>
         </nav>

         {/* Hero Section */}
         <div className="w-full max-w-5xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
            <div className="mb-8 p-4 rounded-3xl animate-bounce" style={{ backgroundColor: 'var(--color-secondary)' }}>
               <LayoutTemplate className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight" style={{ color: 'var(--color-text)' }}>
               {t('preview.title')}
            </h1>
            
            <p className="text-xl md:text-2xl max-w-3xl mb-12 leading-relaxed" style={{ color: 'var(--color-accent)' }}>
               {t('preview.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <button className="px-10 py-5 rounded-full font-bold text-lg hover:-translate-y-1 transition-transform flex items-center justify-center gap-2 shadow-2xl" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)', boxShadow: `0 20px 40px -10px var(--color-primary)` }}>
                 {t('preview.heroButton')} <ArrowRight className="w-5 h-5"/>
               </button>
               <button className="px-10 py-5 rounded-full font-bold text-lg border-2 hover:-translate-y-1 transition-transform" style={{ borderColor: 'var(--color-secondary)', color: 'var(--color-text)' }}>
                 {t('preview.heroButtonSecondary')}
               </button>
            </div>
         </div>

         {/* Feature Grid */}
         <div className="w-full max-w-6xl mx-auto px-6 py-20 pb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { titleKey: 'preview.feature1Title', icon: Shield, descKey: 'preview.feature1Desc' },
                 { titleKey: 'preview.feature2Title', icon: Zap, descKey: 'preview.feature2Desc' },
                 { titleKey: 'preview.feature3Title', icon: LayoutTemplate, descKey: 'preview.feature3Desc' }
               ].map((item, i) => (
                 <div key={i} className="p-8 rounded-[2rem] border-2 hover:-translate-y-3 transition-all duration-500 shadow-xl" style={{ borderColor: 'var(--color-secondary)', backgroundColor: 'transparent' }}>
                   <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transform -rotate-6" style={{ backgroundColor: 'var(--color-primary)' }}>
                      <item.icon className="w-7 h-7" style={{ color: 'var(--color-bg)' }} />
                   </div>
                   <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{t(item.titleKey)}</h3>
                   <p className="text-lg leading-relaxed" style={{ color: 'var(--color-accent)' }}>
                     {t(item.descKey)}
                   </p>
                 </div>
               ))}
            </div>
         </div>

      </div>
    </div>
  );
}
