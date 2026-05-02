import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { colord } from 'colord';
import { usePaletteStore } from '../../stores/usePaletteStore';
import { Pipette } from 'lucide-react';

const HARMONY_OFFSETS = [-60, -30, 30, 60, 180];

export default function ColorWheel() {
  const { t } = useTranslation();
  const { colors, setColors, updateColor } = usePaletteStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(160);

  // Keep refs so pointer handlers never have stale closures
  const radiusRef = useRef(radius);
  const colorsRef = useRef(colors);
  const setColorsRef = useRef(setColors);
  const updateColorRef = useRef(updateColor);

  useEffect(() => { radiusRef.current = radius; }, [radius]);
  useEffect(() => { colorsRef.current = colors; }, [colors]);
  useEffect(() => { setColorsRef.current = setColors; }, [setColors]);
  useEffect(() => { updateColorRef.current = updateColor; }, [updateColor]);

  const internalHsvRef = useRef(colors.map(c => colord(c).toHsv()));
  const activeOrbRef = useRef<number | null>(null);
  const [activeOrb, setActiveOrb] = useState<number | null>(null);

  // Recalculate radius based on container size
  useEffect(() => {
    const updateRadius = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const newRadius = Math.min(Math.max(Math.floor((containerWidth * 0.85) / 2), 100), 220);
      setRadius(newRadius);
    };
    updateRadius();
    const observer = new ResizeObserver(updateRadius);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync internal HSV when colors change from outside (e.g. AI generation)
  useEffect(() => {
    if (activeOrbRef.current === null) {
      internalHsvRef.current = colors.map((c, i) => {
        const parsed = colord(c).toHsv();
        if (parsed.s === 0) return { ...parsed, h: internalHsvRef.current[i]?.h ?? 0 };
        return parsed;
      });
    }
  }, [colors]);

  const getColorCoords = (index: number) => {
    const hsv = internalHsvRef.current[index];
    const r = radiusRef.current;
    const angle = ((hsv.h - 90) * Math.PI) / 180;
    const distance = (hsv.s / 100) * r;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  };

  // Register global pointer handlers ONCE — use refs to avoid stale closures
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const orb = activeOrbRef.current;
      if (orb === null || !wheelRef.current) return;

      // Prevent browser from scrolling while dragging
      e.preventDefault();

      const rect = wheelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = e.clientX - centerX;
      const y = e.clientY - centerY;

      const r = radiusRef.current;
      let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;

      let distance = Math.sqrt(x * x + y * y);
      if (distance > r) distance = r;
      const s = (distance / r) * 100;

      const currentColors = colorsRef.current;

      if (orb === 0) {
        internalHsvRef.current[0] = { h: angle, s, v: 100, a: 1 };
        const newMainHex = colord({ h: angle, s, v: 100, a: 1 }).toHex();

        const newColors = currentColors.map((_, idx) => {
          if (idx === 0) return newMainHex;
          let newH = (angle + HARMONY_OFFSETS[idx - 1]) % 360;
          if (newH < 0) newH += 360;
          internalHsvRef.current[idx] = { h: newH, s, v: 100, a: 1 };
          return colord({ h: newH, s, v: 100, a: 1 }).toHex();
        });

        setColorsRef.current(newColors);
      } else {
        internalHsvRef.current[orb] = { h: angle, s, v: 100, a: 1 };
        const newHex = colord({ h: angle, s, v: 100, a: 1 }).toHex();
        updateColorRef.current(orb, newHex);
      }
    };

    const handlePointerUp = () => {
      if (activeOrbRef.current !== null) {
        activeOrbRef.current = null;
        setActiveOrb(null);
      }
    };

    // passive: false is REQUIRED so we can call e.preventDefault() on mobile
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []); // Empty deps — never re-registers, uses refs for all mutable values

  const startDrag = (e: React.PointerEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    // Capture pointer on the element so it keeps tracking even if finger moves off
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    activeOrbRef.current = index;
    setActiveOrb(index);
  };

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
    } catch (_) {}
  };

  const orbSize = Math.max(28, Math.floor(radius * 0.22));
  const mainOrbSize = Math.max(36, Math.floor(radius * 0.28));

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 w-full">
      <div
        className="relative w-full bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-inner"
        style={{ height: radius * 2 + 64 }}
      >
        <div
          ref={wheelRef}
          className="relative rounded-full shadow-2xl flex-shrink-0"
          style={{
            width: radius * 2,
            height: radius * 2,
            background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
            // Prevent browser scroll/pan from stealing touch events
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          {/* White radial overlay (saturation gradient) */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffffff 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Lines from center to each orb */}
          <svg
            className="absolute inset-0 w-full h-full overflow-visible"
            style={{ pointerEvents: 'none' }}
          >
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

          {/* Secondary orbs */}
          {colors.slice(1).map((color, i) => {
            const index = i + 1;
            const coords = getColorCoords(index);
            return (
              <div
                key={`orb-${index}`}
                className="absolute rounded-full shadow-md border-2 border-white dark:border-zinc-900"
                style={{
                  backgroundColor: color,
                  width: orbSize,
                  height: orbSize,
                  left: `calc(50% + ${coords.x}px)`,
                  top: `calc(50% + ${coords.y}px)`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: activeOrb === index ? 50 : 10,
                  cursor: activeOrb === index ? 'grabbing' : 'grab',
                  touchAction: 'none',
                }}
                onPointerDown={(e) => startDrag(e, index)}
                title={`${t('colorWheel.secondaryOrb')}: ${color}`}
              />
            );
          })}

          {/* Main orb */}
          <div
            className="absolute rounded-full shadow-2xl border-4 border-white dark:border-zinc-950"
            style={{
              backgroundColor: colors[0],
              width: mainOrbSize,
              height: mainOrbSize,
              left: `calc(50% + ${getColorCoords(0).x}px)`,
              top: `calc(50% + ${getColorCoords(0).y}px)`,
              transform: 'translate(-50%, -50%)',
              zIndex: activeOrb === 0 ? 50 : 20,
              cursor: activeOrb === 0 ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
            onPointerDown={(e) => startDrag(e, 0)}
            title={`${t('colorWheel.mainOrb')}: ${colors[0]}`}
          >
            <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded-full pointer-events-none">
              <span className="text-white text-[10px] font-bold drop-shadow-md">
                {t('colorWheel.mainOrb')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={openEyedropper}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full shadow-sm hover:shadow-md transition text-sm font-medium hover:text-indigo-500"
        >
          <Pipette className="w-4 h-4" />
          {t('colorWheel.captureScreen')}
        </button>
      </div>
    </div>
  );
}
