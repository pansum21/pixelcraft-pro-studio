/**
 * Multi-Platform Design Tokens Exporter Hub
 * Converts the active studio design system into Tailwind, Figma Tokens, Flutter, React Native, and CSS variables.
 */

import { appState } from '../state.js';
import { soundManager } from '../utils/soundEffects.js';

export function initTokenExporterTool(showToast) {
  const modal = document.getElementById('tokens-hub-modal');
  const closeBtn = document.getElementById('tokens-modal-close-btn');
  const formatSelect = document.getElementById('tokens-format-select');
  const codeArea = document.getElementById('tokens-output-code');
  const copyBtn = document.getElementById('tokens-copy-btn');
  const downloadBtn = document.getElementById('tokens-download-btn');

  if (!modal || !formatSelect || !codeArea) return;

  function hexToFlutter(hex) {
    const clean = hex.replace('#', '').toUpperCase();
    return `Color(0xFF${clean})`;
  }

  function generateTokens(format = 'tailwind') {
    const slots = appState.getSlots();
    const hexes = slots.map(s => s.hex);

    const primary = hexes[0] || '#6366F1';
    const accent = hexes[1] || '#EC4899';
    const warning = hexes[2] || '#F59E0B';
    const success = hexes[3] || '#10B981';
    const info = hexes[4] || '#3B82F6';

    switch (format) {
      case 'tailwind':
        return `// tailwind.config.js - PixelCraft Studio Design Tokens
module.exports = {
  theme: {
    extend: {
      colors: {
        studio: {
          primary: '${primary}',
          accent: '${accent}',
          warning: '${warning}',
          success: '${success}',
          info: '${info}',
          slots: [
${hexes.map(h => `            '${h}',`).join('\n')}
          ]
        }
      }
    }
  }
};`;

      case 'figma':
        return JSON.stringify({
          color: {
            primary: { value: primary, type: 'color', description: 'Primary brand tone' },
            accent: { value: accent, type: 'color', description: 'Secondary action' },
            warning: { value: warning, type: 'color' },
            success: { value: success, type: 'color' },
            info: { value: info, type: 'color' },
            palette: hexes.reduce((acc, h, i) => {
              acc[`slot_${i + 1}`] = { value: h, type: 'color' };
              return acc;
            }, {})
          }
        }, null, 2);

      case 'flutter':
        return `// Flutter ColorScheme Theme - PixelCraft Design Tokens
import 'package:flutter/material.dart';

class PixelCraftTheme {
  static const ColorScheme darkScheme = ColorScheme.dark(
    primary: ${hexToFlutter(primary)},
    secondary: ${hexToFlutter(accent)},
    tertiary: ${hexToFlutter(warning)},
    surface: Color(0xFF0F172A),
    background: Color(0xFF05070C),
    error: ${hexToFlutter(accent)},
  );

  static const List<Color> activePalette = [
${hexes.map(h => `    ${hexToFlutter(h)},`).join('\n')}
  ];
}`;

      case 'react-native':
        return `// React Native Theme Tokens
export const StudioTheme = {
  colors: {
    primary: '${primary}',
    accent: '${accent}',
    warning: '${warning}',
    success: '${success}',
    info: '${info}',
    background: '#090D16',
    card: '#0D121E',
    text: '#F8FAFC',
    palette: [
${hexes.map(h => `      '${h}',`).join('\n')}
    ]
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20
  }
};`;

      case 'css':
      default:
        return `:root {
  /* PixelCraft Studio Active Tokens */
  --color-primary: ${primary};
  --color-accent: ${accent};
  --color-warning: ${warning};
  --color-success: ${success};
  --color-info: ${info};

  /* Ordered Palette Harmonized Slots */
${hexes.map((h, i) => `  --palette-slot-${i + 1}: ${h};`).join('\n')}
}`;
    }
  }

  function updateCode() {
    const val = formatSelect.value;
    codeArea.value = generateTokens(val);
  }

  // Initial code generation
  updateCode();

  formatSelect.addEventListener('change', () => {
    updateCode();
    soundManager.playClick();
  });

  const openBtns = [
    document.getElementById('sidebar-tokens-btn'),
    document.getElementById('header-tokens-btn'),
    document.getElementById('profile-open-tokens-btn')
  ].filter(Boolean);

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      updateCode();
      if (!modal.open) {
        modal.showModal();
        soundManager.playPop(520);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.close();
      soundManager.playClick();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeArea.value);
      soundManager.playCopy();
      if (showToast) showToast('Design tokens copied to clipboard!');
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const format = formatSelect.value;
      const exts = {
        tailwind: 'tailwind.config.js',
        figma: 'tokens.json',
        flutter: 'pixelcraft_theme.dart',
        'react-native': 'theme.js',
        css: 'tokens.css'
      };
      const fileName = exts[format] || 'tokens.txt';
      const blob = new Blob([codeArea.value], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      soundManager.playPop(660);
      if (showToast) showToast(`Downloaded ${fileName}`);
    });
  }

  appState.subscribe(() => {
    if (modal.open) updateCode();
  });
}
