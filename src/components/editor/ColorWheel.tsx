import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { colord } from 'colord';
import { usePaletteStore } from '../../stores/usePaletteStore';
import { Pipette } from 'lucide-react';


type HsvColor = { h: number; s: number; v: number; a: number };
type HistoryState = { colors: string[]; globalValue: number };

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

function generateAnalogous(baseH: number, baseS: number, baseV: number): HsvColor[] {
  return [
    { h: baseH, s: baseS, v: baseV, a: 1 },
    { h: (baseH - 30 + 360) % 360, s: baseS, v: baseV, a: 1 },
    { h: (baseH + 30) % 360, s: baseS, v: baseV, a: 1 },
    { h: (baseH - 30 + 360) % 360, s: clamp(baseS * 0.75, 0, 100), v: baseV, a: 1 },
    { h: (baseH + 30) % 360, s: clamp(baseS * 0.75, 0, 100), v: baseV, a: 1 },
    { h: baseH, s: baseS, v: clamp(baseV * 0.75, 0, 100), a: 1 },
  ];
}

export default function ColorWheel() {
  const { t } = useTranslation();
  const { colors, setColors } = usePaletteStore();

  const [globalValue, setGlobalValue] = useState(100);
  const [activeOrb, setActiveOrb] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const internalHsvRef = useRef<HsvColor[]>([]);
  const [radius, setRadius] = useState(160);

  /* ── Historial (Undo / Redo) ── */
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef(-1);
  const colorsRef = useRef(colors);
  const globalValueRef = useRef(globalValue);
  colorsRef.current = colors;
  globalValueRef.current = globalValue;

  const pushHistory = useCallback(() => {
    const current: HistoryState = {
      colors: [...colorsRef.current],
      globalValue: globalValueRef.current,
    };

    // Evitar duplicados consecutivos
    const last = historyRef.current[historyRef.current.length - 1];
    if (last && JSON.stringify(last) === JSON.stringify(current)) {
      return;
    }

    // Si estamos en medio del historial (se hizo undo antes), truncar el futuro
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }

    historyRef.current.push(current);
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
    }
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const state = historyRef.current[historyIndexRef.current];
      setColors(state.colors);
      setGlobalValue(state.globalValue);
      internalHsvRef.current = state.colors.map((c) => {
        const parsed = colord(c).toHsv();
        return { h: parsed.h, s: parsed.s, v: parsed.v, a: parsed.a ?? 1 };
      });
    }
  }, [setColors]);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const state = historyRef.current[historyIndexRef.current];
      setColors(state.colors);
      setGlobalValue(state.globalValue);
      internalHsvRef.current = state.colors.map((c) => {
        const parsed = colord(c).toHsv();
        return { h: parsed.h, s: parsed.s, v: parsed.v, a: parsed.a ?? 1 };
      });
    }
  }, [setColors]);

  // Inicializar historial al montar
  useEffect(() => {
    if (historyRef.current.length === 0) {
      pushHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (
          e.key.toLowerCase() === 'y' ||
          (e.key.toLowerCase() === 'z' && e.shiftKey)
        ) {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  /* ── Sincronización store ↔ ref interno ── */
  useEffect(() => {
    if (activeOrb === null) {
      const newHsvs = colors.map((c, i) => {
        const parsed = colord(c).toHsv();
        if (parsed.s === 0) {
          return {
            ...parsed,
            h: internalHsvRef.current[i]?.h ?? 0,
            a: parsed.a ?? 1,
          };
        }
        return { h: parsed.h, s: parsed.s, v: parsed.v, a: parsed.a ?? 1 };
      });
      internalHsvRef.current = newHsvs;
    }
  }, [colors, activeOrb]);

  /* ── Responsive: radio dinámico ── */
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const size = Math.min(entry.contentRect.width, entry.contentRect.height);
        setRadius(Math.max(120, Math.floor(size / 2) - 12));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── Conversión HSV ↔ coordenadas cartesianas ── */
  const getColorCoords = useCallback(
    (index: number) => {
      const hsv = internalHsvRef.current[index];
      if (!hsv) return { x: 0, y: 0 };
      const angle = ((hsv.h - 90) * Math.PI) / 180;
      const distance = (hsv.s / 100) * radius;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      };
    },
    [radius]
  );

  /* ── Drag & Drop (Pointer Events) ── */
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
      if (angle >= 360) angle -= 360;

      let distance = Math.sqrt(x * x + y * y);
      if (distance > radius) distance = radius;
      const s = (distance / radius) * 100;

      if (activeOrb === 0) {
        internalHsvRef.current[0] = { h: angle, s, v: globalValue, a: 1 };
        const harmonyColors = generateAnalogous(angle, s, globalValue);

        const newColors = colors.map((_, idx) => {
          internalHsvRef.current[idx] = harmonyColors[idx];
          return colord(harmonyColors[idx]).toHex();
        });
        setColors(newColors);
      } else {
        internalHsvRef.current[activeOrb] = { h: angle, s, v: globalValue, a: 1 };
        const newHex = colord({ h: angle, s, v: globalValue, a: 1 }).toHex();
        const newColors = [...colors];
        newColors[activeOrb] = newHex;
        setColors(newColors);
      }
    };

    const handlePointerUp = () => {
      if (activeOrb !== null) {
        pushHistory();
      }
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
  }, [activeOrb, colors, setColors, radius, globalValue, pushHistory]);

  /* ── Cambio de Brillo (Value) global ── */
  const handleValueChange = (newValue: number) => {
    setGlobalValue(newValue);
    const newColors = colors.map((_, i) => {
      const hsv = internalHsvRef.current[i];
      if (!hsv) return colors[i];
      // El último orbe (índice 5) siempre conserva el 75 % del brillo global
      const targetV = i === 5 ? clamp(newValue * 0.75, 0, 100) : newValue;
      const newHsv = { ...hsv, v: targetV };
      internalHsvRef.current[i] = newHsv;
      return colord(newHsv).toHex();
    });
    setColors(newColors);
  };

  /* ── EyeDropper ── */
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
      setGlobalValue(parsed.v);

      internalHsvRef.current[0] = { h: parsed.h, s: parsed.s, v: parsed.v, a: 1 };
      const harmonyColors = generateAnalogous(parsed.h, parsed.s, parsed.v);

      const newColors = colors.map((_, idx) => {
        internalHsvRef.current[idx] = harmonyColors[idx];
        return colord(harmonyColors[idx]).toHex();
      });
      setColors(newColors);
      pushHistory();
    } catch (e) {
      /* usuario canceló */
    }
  };

  /* ── Render helpers ── */
  const orbSize = Math.max(22, Math.min(36, radius / 5.5));
  const mainOrbSize = Math.max(30, Math.min(48, radius / 4));

  return (
    <div className="flex flex-col items-center gap-5 w-full select-none">
      {/* ── Rueda cromática ── */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[340px] aspect-square flex-shrink-0 mx-auto"
      >
        <div
          ref={wheelRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-2xl"
          style={{
            width: radius * 2,
            height: radius * 2,
            touchAction: 'none',
            /* 0° HSV (rojo) en la parte superior, recorrido horario */
            background:
              'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
          }}
        >
          {/* Gradiente radial de saturación (blanco → transparente) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #ffffff 0%, transparent 100%)',
            }}
          />

          {/* Overlay de Value (Brillo) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              backgroundColor: 'black',
              opacity: (100 - globalValue) / 100,
            }}
          />

          {/* Líneas desde el centro a cada orbe */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={radius * 2}
            height={radius * 2}
          >
            {colors.map((_, i) => {
              const c = getColorCoords(i);
              return (
                <line
                  key={`line-${i}`}
                  x1={radius}
                  y1={radius}
                  x2={radius + c.x}
                  y2={radius + c.y}
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>

          {/* Orbes secundarios */}
          {colors.slice(1).map((color, i) => {
            const index = i + 1;
            const coords = getColorCoords(index);
            return (
              <div
                key={`orb-${index}`}
                className="absolute cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                style={{
                  left: `calc(50% + ${coords.x}px)`,
                  top: `calc(50% + ${coords.y}px)`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: activeOrb === index ? 50 : 10,
                  width: orbSize,
                  height: orbSize,
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                  setActiveOrb(index);
                }}
              >
                <div
                  className="w-full h-full rounded-full shadow-md border-2 border-white dark:border-zinc-900"
                  style={{ backgroundColor: color }}
                />
              </div>
            );
          })}

          {/* Orbe principal */}
          <div
            className="absolute cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
            style={{
              left: `calc(50% + ${getColorCoords(0).x}px)`,
              top: `calc(50% + ${getColorCoords(0).y}px)`,
              transform: 'translate(-50%, -50%)',
              zIndex: activeOrb === 0 ? 50 : 20,
              width: mainOrbSize,
              height: mainOrbSize,
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              setActiveOrb(0);
            }}
          >
            <div
              className="w-full h-full rounded-full shadow-2xl border-[3px] border-white dark:border-zinc-950"
              style={{ backgroundColor: colors[0] }}
            />
          </div>
        </div>
      </div>

      {/* ── Controles debajo de la rueda ── */}
      <div className="flex flex-col gap-4 w-full max-w-[340px] px-2">
        {/* Slider de Value (Brillo) */}
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t('colorWheel.value')}
            </span>
            <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
              {Math.round(globalValue)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={globalValue}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            onPointerUp={pushHistory}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Cuentagotas */}
        <button
          onClick={openEyedropper}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm hover:shadow-md transition text-sm font-medium hover:text-indigo-500 w-full"
        >
          <Pipette className="w-4 h-4" />
          {t('colorWheel.captureScreen')}
        </button>
      </div>
    </div>
  );
}