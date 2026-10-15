/**
 * CSS Gradient & Glassmorphism Studio Tool
 * Generates linear, radial, and conic gradients, curated presets,
 * and backdrop-filter glassmorphism styles with instant CSS export.
 */

import { appState } from '../state.js';

export function initGradientTool(showToast) {
  const gradientTypeSelect = document.getElementById('gradient-type');
  const gradientAngleSlider = document.getElementById('gradient-angle');
  const gradientAngleVal = document.getElementById('gradient-angle-val');
  const angleControlGroup = document.getElementById('gradient-angle-group');
  const stopsContainer = document.getElementById('gradient-stops-list');
  const addStopBtn = document.getElementById('gradient-add-stop-btn');
  const importPaletteBtn = document.getElementById('gradient-import-palette-btn');
  const previewBox = document.getElementById('gradient-preview-box');
  const cssCodeOutput = document.getElementById('gradient-css-output');
  const copyCssBtn = document.getElementById('gradient-copy-css-btn');
  const presetButtons = document.querySelectorAll('.gradient-preset-btn');

  // Glassmorphism controls
  const glassBlurSlider = document.getElementById('glass-blur-slider');
  const glassBlurVal = document.getElementById('glass-blur-val');
  const glassOpacitySlider = document.getElementById('glass-opacity-slider');
  const glassOpacityVal = document.getElementById('glass-opacity-val');
  const glassRadiusSlider = document.getElementById('glass-radius-slider');
  const glassRadiusVal = document.getElementById('glass-radius-val');
  const glassCard = document.getElementById('glass-preview-card');
  const glassCssOutput = document.getElementById('glass-css-output');
  const copyGlassCssBtn = document.getElementById('glass-copy-css-btn');

  let currentStops = [
    { color: '#6366F1', position: 0 },
    { color: '#EC4899', position: 100 }
  ];

  const presets = {
    aurora: [
      { color: '#10B981', position: 0 },
      { color: '#3B82F6', position: 50 },
      { color: '#8B5CF6', position: 100 }
    ],
    sunset: [
      { color: '#F59E0B', position: 0 },
      { color: '#EF4444', position: 50 },
      { color: '#8B5CF6', position: 100 }
    ],
    cyber: [
      { color: '#06B6D4', position: 0 },
      { color: '#3B82F6', position: 50 },
      { color: '#EC4899', position: 100 }
    ],
    midnight: [
      { color: '#0F172A', position: 0 },
      { color: '#1E293B', position: 50 },
      { color: '#334155', position: 100 }
    ],
    neon: [
      { color: '#4ADE80', position: 0 },
      { color: '#3B82F6', position: 100 }
    ]
  };

  function renderStops() {
    if (!stopsContainer) return;
    stopsContainer.innerHTML = '';

    currentStops.forEach((stop, index) => {
      const row = document.createElement('div');
      row.className = 'stop-row flex items-center gap-2 mb-2';
      row.innerHTML = `
        <input type="color" class="stop-color-input" data-index="${index}" value="${stop.color}">
        <input type="text" class="stop-hex-input text-sm font-mono w-20 px-2 py-1 rounded border border-gray-600 bg-gray-800 text-white" data-index="${index}" value="${stop.color}">
        <input type="range" class="stop-pos-slider flex-1" data-index="${index}" min="0" max="100" value="${stop.position}">
        <span class="stop-pos-text text-xs text-gray-400 w-10 text-right">${stop.position}%</span>
        ${currentStops.length > 2 ? `<button class="stop-remove-btn text-rose-400 hover:text-rose-300 p-1" data-index="${index}" title="Remove Stop">&times;</button>` : ''}
      `;
      stopsContainer.appendChild(row);
    });

    // Attach row events
    stopsContainer.querySelectorAll('.stop-color-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(input.dataset.index, 10);
        currentStops[idx].color = e.target.value;
        const hexInput = stopsContainer.querySelector(`.stop-hex-input[data-index="${idx}"]`);
        if (hexInput) hexInput.value = e.target.value.toUpperCase();
        updateGradient();
      });
    });

    stopsContainer.querySelectorAll('.stop-hex-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(input.dataset.index, 10);
        if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(e.target.value)) {
          currentStops[idx].color = e.target.value;
          const colorInput = stopsContainer.querySelector(`.stop-color-input[data-index="${idx}"]`);
          if (colorInput) colorInput.value = e.target.value;
          updateGradient();
        }
      });
    });

    stopsContainer.querySelectorAll('.stop-pos-slider').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(input.dataset.index, 10);
        currentStops[idx].position = parseInt(e.target.value, 10);
        const posText = input.nextElementSibling;
        if (posText) posText.textContent = `${e.target.value}%`;
        updateGradient();
      });
    });

    stopsContainer.querySelectorAll('.stop-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        currentStops.splice(idx, 1);
        renderStops();
        updateGradient();
      });
    });
  }

  function getGradientCss() {
    const type = gradientTypeSelect ? gradientTypeSelect.value : 'linear';
    const angle = gradientAngleSlider ? gradientAngleSlider.value : 135;

    // Sort stops by position
    const sorted = [...currentStops].sort((a, b) => a.position - b.position);
    const stopString = sorted.map(s => `${s.color} ${s.position}%`).join(', ');

    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stopString})`;
    } else if (type === 'radial') {
      return `radial-gradient(circle at center, ${stopString})`;
    } else if (type === 'conic') {
      return `conic-gradient(from ${angle}deg at 50% 50%, ${stopString})`;
    }
    return `linear-gradient(${angle}deg, ${stopString})`;
  }

  function updateGradient() {
    const grad = getGradientCss();
    if (previewBox) {
      previewBox.style.background = grad;
    }
    if (cssCodeOutput) {
      cssCodeOutput.value = `background: ${grad};`;
    }
  }

  function updateGlassmorphism() {
    if (!glassCard || !glassBlurSlider || !glassOpacitySlider || !glassRadiusSlider) return;

    const blur = glassBlurSlider.value;
    const opacity = (parseInt(glassOpacitySlider.value, 10) / 100).toFixed(2);
    const radius = glassRadiusSlider.value;

    if (glassBlurVal) glassBlurVal.textContent = `${blur}px`;
    if (glassOpacityVal) glassOpacityVal.textContent = `${Math.round(opacity * 100)}%`;
    if (glassRadiusVal) glassRadiusVal.textContent = `${radius}px`;

    const bg = `rgba(255, 255, 255, ${opacity})`;
    const backdrop = `blur(${blur}px)`;
    const border = `1px solid rgba(255, 255, 255, ${(parseFloat(opacity) + 0.15).toFixed(2)})`;
    const shadow = `0 8px 32px 0 rgba(0, 0, 0, 0.37)`;

    glassCard.style.backgroundColor = bg;
    glassCard.style.backdropFilter = backdrop;
    glassCard.style.webkitBackdropFilter = backdrop;
    glassCard.style.borderRadius = `${radius}px`;
    glassCard.style.border = border;
    glassCard.style.boxShadow = shadow;

    if (glassCssOutput) {
      glassCssOutput.value = `/* Glassmorphism CSS */\nbackground: ${bg};\nbackdrop-filter: ${backdrop};\n-webkit-backdrop-filter: ${backdrop};\nborder-radius: ${radius}px;\nborder: ${border};\nbox-shadow: ${shadow};`;
    }
  }

  // Event Listeners for Gradient
  if (gradientTypeSelect) {
    gradientTypeSelect.addEventListener('change', () => {
      const isLinear = gradientTypeSelect.value === 'linear';
      const isConic = gradientTypeSelect.value === 'conic';
      if (angleControlGroup) {
        angleControlGroup.style.display = (isLinear || isConic) ? 'block' : 'none';
      }
      updateGradient();
    });
  }

  if (gradientAngleSlider) {
    gradientAngleSlider.addEventListener('input', (e) => {
      if (gradientAngleVal) gradientAngleVal.textContent = `${e.target.value}°`;
      updateGradient();
    });
  }

  if (addStopBtn) {
    addStopBtn.addEventListener('click', () => {
      if (currentStops.length >= 6) {
        showToast('Maximum 6 stops allowed');
        return;
      }
      const newPos = Math.round((currentStops[0].position + currentStops[currentStops.length - 1].position) / 2);
      currentStops.push({ color: '#A855F7', position: newPos });
      renderStops();
      updateGradient();
      showToast('Added color stop');
    });
  }

  if (importPaletteBtn) {
    importPaletteBtn.addEventListener('click', () => {
      const hexes = appState.getHexes();
      if (hexes && hexes.length > 0) {
        currentStops = hexes.slice(0, 5).map((hex, i, arr) => ({
          color: hex,
          position: Math.round((i / (arr.length - 1)) * 100)
        }));
        renderStops();
        updateGradient();
        showToast(`Imported ${currentStops.length} colors from Palette!`);
      }
    });
  }

  if (copyCssBtn && cssCodeOutput) {
    copyCssBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(cssCodeOutput.value);
      showToast('Gradient CSS copied to clipboard!');
    });
  }

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      if (presets[presetKey]) {
        currentStops = JSON.parse(JSON.stringify(presets[presetKey]));
        renderStops();
        updateGradient();
        showToast(`Applied ${presetKey} preset`);
      }
    });
  });

  // Event Listeners for Glassmorphism
  if (glassBlurSlider) glassBlurSlider.addEventListener('input', updateGlassmorphism);
  if (glassOpacitySlider) glassOpacitySlider.addEventListener('input', updateGlassmorphism);
  if (glassRadiusSlider) glassRadiusSlider.addEventListener('input', updateGlassmorphism);

  if (copyGlassCssBtn && glassCssOutput) {
    copyGlassCssBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(glassCssOutput.value);
      showToast('Glassmorphism CSS copied!');
    });
  }

  // Initial render
  renderStops();
  updateGradient();
  updateGlassmorphism();
}
