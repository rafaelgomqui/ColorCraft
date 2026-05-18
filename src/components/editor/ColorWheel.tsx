import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { colord } from 'colord';
import { usePaletteStore } from '../../stores/usePaletteStore';
import { Pipette } from 'lucide-react';

const HARMONY_OFFSETS = [-60, -30, 30, 60, 180];

export default function ColorWheel() {
  const { t } = useTranslation();
  const { colors, setColors, updateColor } = usePaletteStore();
  const radius = 180;
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const internalHsvRef = useRef(colors.map(c => colord(c).toHsv()));
  
  const [activeOrb, setActiveOrb] = useState<number | null>(null);

  useEffect(() => {
    if (activeOrb === null) {
      internalHsvRef.current = colors.map((c, i) => {
        const parsed = colord(c).toHsv();
        if (parsed.s === 0) return { ...parsed, h: internalHsvRef.current[i].h };
        return parsed;
      });
    }
  }, [colors, activeOrb]);

  const getColorCoords = (index: number) => {
    const hsv = internalHsvRef.current[index];
    const angle = ((hsv.h - 90) * Math.PI) / 180;
    const distance = (hsv.s / 100) * radius;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (activeOrb === null || !wheelRef.current) return;
      
      const rect = wheelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      
      let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;
      
      let distance = Math.sqrt(x*x + y*y);
      if (distance > radius) distance = radius;
      
      const s = (distance / radius) * 100;

      if (activeOrb === 0) {
        internalHsvRef.current[0] = { h: angle, s, v: 100, a: 1 };
        const newMainHex = colord({ h: angle, s, v: 100, a: 1 }).toHex();
        
        const newColors = colors.map((_, idx) => {
          if (idx === 0) return newMainHex;
          
          let newH = (angle + HARMONY_OFFSETS[idx - 1]) % 360;
          if (newH < 0) newH += 360;
          
          internalHsvRef.current[idx] = { h: newH, s, v: 100, a: 1 };
          return colord({ h: newH, s, v: 100, a: 1 }).toHex();
        });
        
        setColors(newColors);
      } else {
        internalHsvRef.current[activeOrb] = { h: angle, s, v: 100, a: 1 };
        const newHex = colord({ h: angle, s, v: 100, a: 1 }).toHex();
        updateColor(activeOrb, newHex);
      }
    };

    const handlePointerUp = () => {
      setActiveOrb(null);
    };

    if (activeOrb !== null) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeOrb, colors, setColors, updateColor]);

  const openEyedropper = async () => {
    if (!('EyeDropper' in window)) {
      alert(t('colorWheel.eyedropperNotSupported'));
      return;
    }
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      
      const parsed = colord(result.sRGBHex).toHsv();
      const newMainHex = colord({ h: parsed.h, s: parsed.s, v: 100, a: 1 }).toHex();
      
      internalHsvRef.current[0] = { h: parsed.h, s: parsed.s, v: 100, a: 1 };
      
      const newColors = colors.map((_, idx) => {
        if (idx === 0) return newMainHex;
        let newH = (parsed.h + HARMONY_OFFSETS[idx - 1]) % 360;
        if (newH < 0) newH += 360;
        internalHsvRef.current[idx] = { h: newH, s: parsed.s, v: 100, a: 1 };
        return colord({ h: newH, s: parsed.s, v: 100, a: 1 }).toHex();
      });
      setColors(newColors);
    } catch (e) { }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative w-full max-w-[500px] h-[500px] bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-inner">
        <div 
          ref={wheelRef}
          className="relative rounded-full shadow-2xl transition-transform"
          style={{
            width: radius * 2,
            height: radius * 2,
            background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)'
          }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ffffff 0%, transparent 100%)'
          }} />

          <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible">
            {colors.map((_, i) => {
              const coords = getColorCoords(i);
              return (
                <line 
                  key={`line-${i}`}
                  x1={radius} 
                  y1={radius} 
                  x2={radius + coords.x} 
                  y2={radius + coords.y} 
                  stroke="rgba(0,0,0,0.3)" 
                  strokeWidth="2" 
                />
              );
            })}
          </svg>

          {colors.slice(1).map((color, i) => {
            const index = i + 1;
            const coords = getColorCoords(index);
            return (
              <div
                key={`orb-${index}`}
                className="absolute w-10 h-10 rounded-full shadow-md border-2 border-white dark:border-zinc-900 cursor-grab active:cursor-grabbing hover:scale-110"
                style={{ 
                  backgroundColor: color, 
                  left: `calc(50% + ${coords.x}px)`, 
                  top: `calc(50% + ${coords.y}px)`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: activeOrb === index ? 50 : 10
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setActiveOrb(index);
                }}
                title={`${t('colorWheel.secondaryOrb')}: ${color}`}
              />
            );
          })}

          <div
            className="absolute w-14 h-14 rounded-full shadow-2xl border-4 border-white dark:border-zinc-950 cursor-grab active:cursor-grabbing hover:scale-105"
            style={{ 
              backgroundColor: colors[0], 
              left: `calc(50% + ${getColorCoords(0).x}px)`, 
              top: `calc(50% + ${getColorCoords(0).y}px)`,
              transform: 'translate(-50%, -50%)',
              zIndex: activeOrb === 0 ? 50 : 20
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              setActiveOrb(0);
            }}
            title={`${t('colorWheel.mainOrb')}: ${colors[0]}`}
          >
            <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded-full pointer-events-none">
              <span className="text-white text-[10px] font-bold drop-shadow-md">{t('colorWheel.mainOrb')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={openEyedropper}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full shadow-sm hover:shadow-md transition text-sm font-medium hover:text-indigo-500"
        >
          <Pipette className="w-5 h-5" />
          {t('colorWheel.captureScreen')}
        </button>
      </div>
      <p>hola soy rafael</p>
    </div>
  );
}
