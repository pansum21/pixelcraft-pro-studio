/**
 * Color Utilities for Design & Media Tools Hub
 * Handles HEX, RGB, HSL conversions, WCAG 2.1 Luminance & Contrast,
 * Color Harmonies, Algorithmic Color Naming, and Tailwind-style Shade Ramps.
 */

export function hexToRgb(hex) {
  let cleanHex = hex.replace(/^#/, '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = v => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);

  return { r, g, b };
}

/**
 * Simulates color vision deficiencies (Color Blindness)
 * Modes: 'normal', 'deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia'
 */
export function simulateColorBlindness(hex, mode = 'normal') {
  if (mode === 'normal') return hex;
  const { r, g, b } = hexToRgb(hex);

  let sr = r, sg = g, sb = b;

  if (mode === 'deuteranopia') {
    // Green-blind
    sr = 0.625 * r + 0.375 * g;
    sg = 0.700 * r + 0.300 * g;
    sb = 0.300 * g + 0.700 * b;
  } else if (mode === 'protanopia') {
    // Red-blind
    sr = 0.567 * r + 0.433 * g;
    sg = 0.558 * r + 0.442 * g;
    sb = 0.242 * g + 0.758 * b;
  } else if (mode === 'tritanopia') {
    // Blue-yellow blind
    sr = 0.950 * r + 0.050 * g;
    sg = 0.433 * g + 0.567 * b;
    sb = 0.475 * g + 0.525 * b;
  } else if (mode === 'achromatopsia') {
    // Complete monochrome / grayscale
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    sr = gray;
    sg = gray;
    sb = gray;
  }

  return rgbToHex(sr, sg, sb);
}

export function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * WCAG 2.1 Relative Luminance Calculation
 */
export function getRelativeLuminance(r, g, b) {
  const normalize = c => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const rs = normalize(r);
  const gs = normalize(g);
  const bs = normalize(b);
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * WCAG 2.1 Contrast Ratio
 */
export function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function getWcagLevels(ratio) {
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3.0,
    aaaNormal: ratio >= 7.0,
    aaaLarge: ratio >= 4.5,
    uiComponents: ratio >= 3.0
  };
}

export function getIdealTextColor(bgHex) {
  const blackRatio = getContrastRatio(bgHex, '#000000');
  const whiteRatio = getContrastRatio(bgHex, '#FFFFFF');
  return whiteRatio >= blackRatio ? '#FFFFFF' : '#0B0F19';
}

/**
 * Algorithmic Color Naming (Vibrant, creative design names)
 */
export function getColorName(hex) {
  const rgb = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  if (s < 10) {
    if (l < 15) return 'Obsidian Black';
    if (l < 30) return 'Onyx Charcoal';
    if (l < 55) return 'Slate Steel';
    if (l < 85) return 'Misty Silver';
    return 'Pure Snow';
  }

  let prefix = '';
  if (l < 25) prefix = 'Deep ';
  else if (l < 40) prefix = 'Dark ';
  else if (l > 75) prefix = 'Ethereal ';
  else if (l > 60) prefix = 'Bright ';
  else if (s > 75) prefix = 'Electric ';
  else if (s < 40) prefix = 'Muted ';

  let base = '';
  if (h >= 345 || h < 15) base = 'Crimson';
  else if (h < 40) base = 'Sunset Amber';
  else if (h < 65) base = 'Solar Gold';
  else if (h < 150) base = 'Emerald Green';
  else if (h < 190) base = 'Cyan Aqua';
  else if (h < 220) base = 'Cerulean Sky';
  else if (h < 260) base = 'Cosmic Indigo';
  else if (h < 300) base = 'Ultra Violet';
  else if (h < 345) base = 'Neon Magenta';

  return `${prefix}${base}`;
}

/**
 * Generates Tailwind-style 10-shade tonal ramp (50 to 900)
 */
export function generateShades(hex) {
  const rgb = hexToRgb(hex);
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const steps = [
    { name: '50', l: 96 },
    { name: '100', l: 90 },
    { name: '200', l: 80 },
    { name: '300', l: 70 },
    { name: '400', l: 60 },
    { name: '500', l: 50 },
    { name: '600', l: 40 },
    { name: '700', l: 30 },
    { name: '800', l: 20 },
    { name: '900', l: 12 }
  ];

  return steps.map(step => ({
    name: step.name,
    hex: hslToHex(h, Math.min(100, s), step.l)
  }));
}

/**
 * Generate harmonious palettes from a base HSL
 */
export function generateHarmonies(baseH, baseS, baseL, type = 'complementary', count = 5) {
  const colors = [];
  const h = baseH;
  const s = baseS;
  const l = baseL;

  switch (type) {
    case 'complementary':
      for (let i = 0; i < count; i++) {
        if (i % 2 === 0) {
          colors.push({ h, s, l: Math.max(15, Math.min(85, l + (i * 10 - 20))) });
        } else {
          colors.push({ h: (h + 180) % 360, s, l: Math.max(15, Math.min(85, l + (i * 10 - 20))) });
        }
      }
      break;

    case 'analogous':
      for (let i = 0; i < count; i++) {
        const offset = (i - Math.floor(count / 2)) * 25;
        colors.push({ h: (h + offset + 360) % 360, s, l: Math.max(20, Math.min(85, l + (i % 2 === 0 ? 5 : -5))) });
      }
      break;

    case 'triadic':
      for (let i = 0; i < count; i++) {
        const angle = (i % 3) * 120;
        colors.push({ h: (h + angle) % 360, s, l: Math.max(20, Math.min(80, l + (i >= 3 ? 15 : 0))) });
      }
      break;

    case 'monochromatic':
      for (let i = 0; i < count; i++) {
        const stepL = Math.round(18 + (i * (74 / (count - 1))));
        colors.push({ h, s: Math.max(25, s), l: stepL });
      }
      break;

    case 'tetradic':
      for (let i = 0; i < count; i++) {
        const angle = (i % 4) * 90;
        colors.push({ h: (h + angle) % 360, s, l: Math.max(20, Math.min(80, l + (i >= 4 ? 20 : 0))) });
      }
      break;

    case 'split-complementary':
      const splits = [0, 150, 210, 150, 0];
      for (let i = 0; i < count; i++) {
        const offset = splits[i % splits.length];
        colors.push({ h: (h + offset) % 360, s, l: Math.max(20, Math.min(85, l + (i * 8 - 16))) });
      }
      break;

    default: // Random aesthetic
      for (let i = 0; i < count; i++) {
        colors.push({
          h: Math.floor(Math.random() * 360),
          s: Math.floor(55 + Math.random() * 40),
          l: Math.floor(35 + Math.random() * 40)
        });
      }
      break;
  }

  return colors.slice(0, count).map(c => hslToHex(c.h, c.s, c.l));
}

export function autoFixContrast(fgHex, bgHex, targetRatio = 4.5) {
  const currentRatio = getContrastRatio(fgHex, bgHex);
  if (currentRatio >= targetRatio) return fgHex;

  const fgRgb = hexToRgb(fgHex);
  const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);

  const whiteRatio = getContrastRatio('#FFFFFF', bgHex);
  const blackRatio = getContrastRatio('#000000', bgHex);

  // Determine which direction can reach targetRatio
  let preferLighten = whiteRatio >= targetRatio;
  if (!preferLighten && blackRatio >= targetRatio) {
    preferLighten = false;
  } else if (whiteRatio >= targetRatio && blackRatio >= targetRatio) {
    preferLighten = fgHsl.l >= 50;
  } else {
    preferLighten = whiteRatio > blackRatio;
  }

  // Try preferred direction first
  for (let step = 1; step <= 100; step++) {
    const testL = preferLighten ? Math.min(100, fgHsl.l + step) : Math.max(0, fgHsl.l - step);
    const testHex = hslToHex(fgHsl.h, fgHsl.s, testL);
    if (getContrastRatio(testHex, bgHex) >= targetRatio) {
      return testHex;
    }
  }

  // If preferred direction did not reach target, try the other direction
  for (let step = 1; step <= 100; step++) {
    const testL = !preferLighten ? Math.min(100, fgHsl.l + step) : Math.max(0, fgHsl.l - step);
    const testHex = hslToHex(fgHsl.h, fgHsl.s, testL);
    if (getContrastRatio(testHex, bgHex) >= targetRatio) {
      return testHex;
    }
  }

  return whiteRatio >= blackRatio ? '#FFFFFF' : '#000000';
}
