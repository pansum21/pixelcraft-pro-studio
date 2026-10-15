/**
 * WCAG Color Contrast Checker Tool
 * Analyzes contrast ratios, verifies WCAG 2.1 standards, provides live interactive preview,
 * circular progress meter animation, and includes an intelligent auto-fixer and
 * bidirectional sync with the active Palette.
 */

import {
  getContrastRatio,
  getWcagLevels,
  autoFixContrast,
  hexToRgb,
  rgbToHex,
  getIdealTextColor
} from '../utils/colorUtils.js';
import { appState } from '../state.js';

let contrastApi = null;

export function setContrastColors(newFg, newBg, slotIndex = null) {
  if (contrastApi) {
    if (slotIndex !== null) {
      appState.setActiveContrastSlot(slotIndex);
    }
    contrastApi.setColors(newFg, newBg);
  }
}

export function initContrastTool(showToast) {
  const fgPicker = document.getElementById('contrast-fg-picker');
  const fgText = document.getElementById('contrast-fg-text');
  const bgPicker = document.getElementById('contrast-bg-picker');
  const bgText = document.getElementById('contrast-bg-text');
  const swapBtn = document.getElementById('contrast-swap-btn');
  const autoFixAaBtn = document.getElementById('contrast-autofix-aa-btn');
  const autoFixAaaBtn = document.getElementById('contrast-autofix-aaa-btn');
  const syncBackBtn = document.getElementById('contrast-sync-palette-btn');

  // Palette quick-pick shelf in Contrast Checker
  const paletteSwatchesContainer = document.getElementById('contrast-palette-swatches');

  // Result Elements
  const ratioScore = document.getElementById('contrast-ratio-score');
  const ratioSummary = document.getElementById('contrast-ratio-summary');
  const gaugeProgressCircle = document.getElementById('gauge-progress-circle');
  const aaNormalBadge = document.getElementById('badge-aa-normal');
  const aaLargeBadge = document.getElementById('badge-aa-large');
  const aaaNormalBadge = document.getElementById('badge-aaa-normal');
  const aaaLargeBadge = document.getElementById('badge-aaa-large');
  const uiBadge = document.getElementById('badge-ui-components');

  // Live Preview Elements
  const previewBox = document.getElementById('contrast-preview-box');
  const previewHeading = document.getElementById('preview-heading');
  const previewBody = document.getElementById('preview-body');
  const previewButton = document.getElementById('preview-btn');
  const previewOutlineBtn = document.getElementById('preview-outline-btn');
  const previewCard = document.getElementById('preview-card');

  // Preset Buttons
  const presetBtns = document.querySelectorAll('.contrast-preset-btn');

  let fg = fgText ? fgText.value.trim() : '#1E293B';
  let bg = bgText ? bgText.value.trim() : '#F8FAFC';

  function isValidHex(hex) {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
  }

  function normalizeHex(hex) {
    if (!hex.startsWith('#')) hex = '#' + hex;
    const rgb = hexToRgb(hex);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  function updateBadge(el, isPass) {
    if (!el) return;
    if (isPass) {
      el.className = 'status-badge pass';
      el.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Pass`;
    } else {
      el.className = 'status-badge fail';
      el.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Fail`;
    }
  }

  function updateSyncBackButton() {
    if (!syncBackBtn) return;
    if (appState.activeContrastSlot !== null) {
      const slotNum = appState.activeContrastSlot + 1;
      syncBackBtn.style.display = 'inline-flex';
      syncBackBtn.innerHTML = `🔄 Update Palette Slot ${slotNum} with ${fg}`;
    } else {
      syncBackBtn.style.display = 'none';
    }
  }

  function calculateAndRender() {
    if (!isValidHex(fg) || !isValidHex(bg)) return;

    const cleanFg = normalizeHex(fg);
    const cleanBg = normalizeHex(bg);

    const ratio = getContrastRatio(cleanFg, cleanBg);
    const levels = getWcagLevels(ratio);

    if (ratioScore) {
      ratioScore.textContent = `${ratio.toFixed(2)}:1`;
    }

    // Animate Circular Gauge
    if (gaugeProgressCircle) {
      const circumference = 326.7; // 2 * PI * 52
      const progress = Math.min(1, Math.max(0, (ratio - 1) / 20)); // scale 1 to 21
      const offset = circumference - (progress * circumference);
      gaugeProgressCircle.style.strokeDashoffset = offset;

      if (ratio >= 7.0) {
        gaugeProgressCircle.style.stroke = '#10b981';
      } else if (ratio >= 4.5) {
        gaugeProgressCircle.style.stroke = '#06b6d4';
      } else if (ratio >= 3.0) {
        gaugeProgressCircle.style.stroke = '#f59e0b';
      } else {
        gaugeProgressCircle.style.stroke = '#ef4444';
      }
    }

    if (ratioSummary) {
      if (ratio >= 7.0) {
        ratioSummary.textContent = 'Passes WCAG AAA (Enhanced accessibility)';
        ratioSummary.className = 'ratio-summary text-emerald-400';
        ratioSummary.style.color = '#10b981';
      } else if (ratio >= 4.5) {
        ratioSummary.textContent = 'Passes WCAG AA (Standard for normal body text)';
        ratioSummary.className = 'ratio-summary text-cyan-400';
        ratioSummary.style.color = '#06b6d4';
      } else if (ratio >= 3.0) {
        ratioSummary.textContent = 'Passes for large headings & graphic UI only';
        ratioSummary.className = 'ratio-summary text-amber-400';
        ratioSummary.style.color = '#f59e0b';
      } else {
        ratioSummary.textContent = 'Fails basic WCAG accessibility requirements';
        ratioSummary.className = 'ratio-summary text-rose-400';
        ratioSummary.style.color = '#ef4444';
      }
    }

    updateBadge(aaNormalBadge, levels.aaNormal);
    updateBadge(aaLargeBadge, levels.aaLarge);
    updateBadge(aaaNormalBadge, levels.aaaNormal);
    updateBadge(aaaLargeBadge, levels.aaaLarge);
    updateBadge(uiBadge, levels.uiComponents);

    // Live preview updating
    if (previewBox) previewBox.style.backgroundColor = cleanBg;
    if (previewHeading) previewHeading.style.color = cleanFg;
    if (previewBody) previewBody.style.color = cleanFg;
    if (previewButton) {
      previewButton.style.backgroundColor = cleanFg;
      previewButton.style.color = cleanBg;
    }
    if (previewOutlineBtn) {
      previewOutlineBtn.style.color = cleanFg;
      previewOutlineBtn.style.borderColor = cleanFg;
    }
    if (previewCard) {
      previewCard.style.borderColor = cleanFg + '33';
      previewCard.style.color = cleanFg;
    }

    updateSyncBackButton();
  }

  function setColors(newFg, newBg) {
    fg = normalizeHex(newFg);
    bg = normalizeHex(newBg);
    if (fgPicker) fgPicker.value = fg;
    if (fgText) fgText.value = fg;
    if (bgPicker) bgPicker.value = bg;
    if (bgText) bgText.value = bg;
    calculateAndRender();
  }

  // Render Palette Quick-Pick Swatches inside Contrast Tool
  function renderPaletteSwatches(slots) {
    if (!paletteSwatchesContainer) return;
    paletteSwatchesContainer.innerHTML = '';

    slots.forEach((slot, idx) => {
      const chip = document.createElement('div');
      chip.className = 'contrast-palette-chip';
      chip.title = `Slot ${idx + 1}: ${slot.hex} (Click: Set Foreground, Shift+Click: Set Background)`;
      chip.innerHTML = `
        <span class="chip-color-dot" style="background:${slot.hex}"></span>
        <span class="chip-slot-tag">${idx + 1}</span>
      `;

      chip.addEventListener('click', (e) => {
        if (e.shiftKey) {
          setColors(fg, slot.hex);
          showToast(`Set Background to Slot ${idx + 1} (${slot.hex})`);
        } else {
          setColors(slot.hex, bg);
          appState.setActiveContrastSlot(idx);
          showToast(`Set Foreground to Slot ${idx + 1} (${slot.hex})`);
        }
      });

      paletteSwatchesContainer.appendChild(chip);
    });
  }

  // Subscribe to Palette updates
  appState.subscribe((slots) => {
    renderPaletteSwatches(slots);
    updateSyncBackButton();
  });

  // Event handlers
  if (fgPicker && fgText) {
    fgPicker.addEventListener('input', (e) => {
      fg = e.target.value.toUpperCase();
      fgText.value = fg;
      calculateAndRender();
    });
    fgText.addEventListener('input', (e) => {
      if (isValidHex(e.target.value)) {
        fg = normalizeHex(e.target.value);
        fgPicker.value = fg;
        calculateAndRender();
      }
    });
  }

  if (bgPicker && bgText) {
    bgPicker.addEventListener('input', (e) => {
      bg = e.target.value.toUpperCase();
      bgText.value = bg;
      calculateAndRender();
    });
    bgText.addEventListener('input', (e) => {
      if (isValidHex(e.target.value)) {
        bg = normalizeHex(e.target.value);
        bgPicker.value = bg;
        calculateAndRender();
      }
    });
  }

  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      setColors(bg, fg);
      showToast('Swapped foreground & background');
    });
  }

  if (autoFixAaBtn) {
    autoFixAaBtn.addEventListener('click', () => {
      const fixedFg = autoFixContrast(fg, bg, 4.5);
      setColors(fixedFg, bg);
      showToast('Foreground adjusted to pass WCAG AA (4.5:1)');
    });
  }

  if (autoFixAaaBtn) {
    autoFixAaaBtn.addEventListener('click', () => {
      const fixedFg = autoFixContrast(fg, bg, 7.0);
      setColors(fixedFg, bg);
      showToast('Foreground adjusted to pass WCAG AAA (7.0:1)');
    });
  }

  if (syncBackBtn) {
    syncBackBtn.addEventListener('click', () => {
      if (appState.activeContrastSlot !== null) {
        appState.updateSlot(appState.activeContrastSlot, fg);
        showToast(`Updated Palette Slot ${appState.activeContrastSlot + 1} with ${fg}!`);
      }
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pFg = btn.dataset.fg;
      const pBg = btn.dataset.bg;
      if (pFg && pBg) {
        setColors(pFg, pBg);
        showToast(`Loaded: ${btn.textContent.trim()}`);
      }
    });
  });

  // Expose API for cross-tool orchestration
  contrastApi = { setColors, calculateAndRender };

  // Initial render with current state
  renderPaletteSwatches(appState.getSlots());
  calculateAndRender();
}
