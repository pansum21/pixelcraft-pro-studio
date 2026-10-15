/**
 * Smooth Multi-Layered CSS Shadow & Colored Glow Studio
 * Generates natural physics-based layered shadows and ambient colored blooms.
 * Direct bridge to cast glow matching the Active Palette.
 */

import { appState } from '../state.js';
import { hexToRgb } from '../utils/colorUtils.js';

export function initShadowTool(showToast) {
  const elevationSlider = document.getElementById('shadow-elevation-slider');
  const elevationVal = document.getElementById('shadow-elevation-val');
  const blurSlider = document.getElementById('shadow-blur-slider');
  const blurVal = document.getElementById('shadow-blur-val');
  const opacitySlider = document.getElementById('shadow-opacity-slider');
  const opacityVal = document.getElementById('shadow-opacity-val');
  const angleSlider = document.getElementById('shadow-angle-slider');
  const angleVal = document.getElementById('shadow-angle-val');
  const coloredGlowCheck = document.getElementById('shadow-glow-check');
  const glowColorPicker = document.getElementById('shadow-glow-picker');
  const importPaletteBtn = document.getElementById('shadow-import-palette-btn');
  const copyCssBtn = document.getElementById('shadow-copy-css-btn');
  const copyTailwindBtn = document.getElementById('shadow-copy-tailwind-btn');

  const previewCard = document.getElementById('shadow-specimen-card');
  const cssOutput = document.getElementById('shadow-css-output');
  const presetBtns = document.querySelectorAll('.shadow-preset-btn');

  let currentGlowColor = '#6366F1';

  function calculateLayeredShadow() {
    const elevation = parseInt(elevationSlider ? elevationSlider.value : '3', 10);
    const blurFactor = parseFloat(blurSlider ? blurSlider.value : '1.0');
    const baseOpacity = parseFloat(opacitySlider ? opacitySlider.value : '0.15');
    const angleDeg = parseInt(angleSlider ? angleSlider.value : '45', 10);
    const hasColoredGlow = coloredGlowCheck ? coloredGlowCheck.checked : false;

    // Angle to X and Y offsets
    const rad = (angleDeg * Math.PI) / 180;
    const dirX = Math.sin(rad);
    const dirY = Math.cos(rad);

    const layers = [];
    const count = Math.min(6, elevation + 2);

    for (let i = 1; i <= count; i++) {
      const step = Math.pow(i / count, 1.8);
      const x = (dirX * step * elevation * 12).toFixed(1);
      const y = (dirY * step * elevation * 16).toFixed(1);
      const blur = (step * elevation * 32 * blurFactor).toFixed(1);
      const spread = (-(step * elevation * 2.5)).toFixed(1);
      const alpha = (baseOpacity * Math.pow(1 - (i / (count + 1)), 0.65)).toFixed(3);

      layers.push(`${x}px ${y}px ${blur}px ${spread}px rgba(0, 0, 0, ${alpha})`);
    }

    if (hasColoredGlow) {
      const rgb = hexToRgb(currentGlowColor) || { r: 99, g: 102, b: 241 };
      const glowBlur = (elevation * 24 * blurFactor).toFixed(1);
      const glowSpread = (elevation * 4).toFixed(1);
      layers.push(`0px 0px ${glowBlur}px ${glowSpread}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`);
    }

    const cssString = layers.join(',\n  ');
    return cssString;
  }

  function updateShadow() {
    const shadowValue = calculateLayeredShadow();

    if (previewCard) {
      previewCard.style.boxShadow = shadowValue;
    }

    if (cssOutput) {
      cssOutput.value = `box-shadow: ${shadowValue};`;
    }
  }

  // Event Listeners
  if (elevationSlider) {
    elevationSlider.addEventListener('input', (e) => {
      if (elevationVal) elevationVal.textContent = `Level ${e.target.value}`;
      updateShadow();
    });
  }

  if (blurSlider) {
    blurSlider.addEventListener('input', (e) => {
      if (blurVal) blurVal.textContent = `${e.target.value}x`;
      updateShadow();
    });
  }

  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      if (opacityVal) opacityVal.textContent = `${Math.round(e.target.value * 100)}%`;
      updateShadow();
    });
  }

  if (angleSlider) {
    angleSlider.addEventListener('input', (e) => {
      if (angleVal) angleVal.textContent = `${e.target.value}°`;
      updateShadow();
    });
  }

  if (coloredGlowCheck) coloredGlowCheck.addEventListener('change', updateShadow);

  if (glowColorPicker) {
    glowColorPicker.addEventListener('input', (e) => {
      currentGlowColor = e.target.value;
      if (coloredGlowCheck) coloredGlowCheck.checked = true;
      updateShadow();
    });
  }

  if (importPaletteBtn) {
    importPaletteBtn.addEventListener('click', () => {
      const hexes = appState.getHexes();
      if (hexes && hexes.length > 0) {
        currentGlowColor = hexes[0];
        if (glowColorPicker) glowColorPicker.value = currentGlowColor;
        if (coloredGlowCheck) coloredGlowCheck.checked = true;
        updateShadow();
        showToast(`Matched ambient glow to Palette Primary (${currentGlowColor})!`);
      }
    });
  }

  if (copyCssBtn && cssOutput) {
    copyCssBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(cssOutput.value);
      showToast('Copied layered box-shadow CSS!');
    });
  }

  if (copyTailwindBtn) {
    copyTailwindBtn.addEventListener('click', () => {
      const clean = calculateLayeredShadow().replace(/\n/g, '').replace(/\s+/g, '_');
      const tw = `shadow-[${clean}]`;
      navigator.clipboard.writeText(tw);
      showToast('Copied Tailwind arbitrary shadow class!');
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const level = btn.dataset.level;
      if (elevationSlider && level) {
        elevationSlider.value = level;
        if (elevationVal) elevationVal.textContent = `Level ${level}`;
        updateShadow();
      }
    });
  });

  // Initial render
  updateShadow();
}
