import { colord, extend } from 'colord';
import labPlugin from 'colord/plugins/lab';

extend([labPlugin]);

export const getColorFormats = (hex: string) => {
  const c = colord(hex);
  const rgb = c.toRgb();
  const hsv = c.toHsv();
  const lab = c.toLab();

  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsb: `hsb(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`,
    lab: `lab(${Math.round(lab.l)}, ${Math.round(lab.a)}, ${Math.round(lab.b)})`
  };
};
