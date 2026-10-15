/**
 * Color Palette Generator Tool
 * Interactive palette creation, variable slot count (3-7), creative color names,
 * Tailwind-style shade ramps, Full Palette Contrast Matrix, UI System Simulator,
 * and direct 1-click bridge to Contrast Checker.
 */

import {
  generateHarmonies,
  rgbToHsl,
  hexToRgb,
  hslToHex,
  getIdealTextColor,
  getContrastRatio,
  getColorName,
  generateShades
} from '../utils/colorUtils.js';
import { appState } from '../state.js';
import { setContrastColors } from './contrast.js';
import { soundManager } from '../utils/soundEffects.js';

export function initPaletteTool(showToast) {
  const container = document.getElementById('palette-container');
  if (!container) return;

  const harmonySelect = document.getElementById('palette-harmony-select');
  const generateBtn = document.getElementById('palette-generate-btn');
  const exportBtn = document.getElementById('palette-export-btn');
  const exportModal = document.getElementById('palette-export-modal');
  const closeModalBtn = document.getElementById('palette-close-modal-btn');
  const copyExportBtn = document.getElementById('palette-copy-export-btn');
  const downloadPngBtn = document.getElementById('palette-download-png-btn');
  const exportFormatSelect = document.getElementById('palette-export-format');
  const exportOutput = document.getElementById('palette-export-output');

  // Shade Ramp Modal Elements
  const shadesModal = document.getElementById('shades-ramp-modal');
  const shadesModalClose = document.getElementById('shades-modal-close-btn');
  const shadesGrid = document.getElementById('shades-ramp-grid');
  const shadesBaseName = document.getElementById('shades-base-name');

  // Contrast Matrix Modal Elements
  const matrixModal = document.getElementById('contrast-matrix-modal');
  const matrixModalClose = document.getElementById('matrix-modal-close-btn');
  const matrixBtn = document.getElementById('palette-matrix-btn');
  const matrixContainer = document.getElementById('contrast-matrix-table-wrap');

  // UI System Preview Elements
  const uiPreviewToggleBtn = document.getElementById('palette-ui-preview-toggle');
  const uiPreviewDrawer = document.getElementById('palette-ui-preview-drawer');
  const uiModeLightBtn = document.getElementById('ui-preview-mode-light');
  const uiModeDarkBtn = document.getElementById('ui-preview-mode-dark');

  // Add / Remove slot buttons
  const addSlotBtn = document.getElementById('palette-add-slot-btn');
  const removeSlotBtn = document.getElementById('palette-remove-slot-btn');

  let slots = appState.getSlots();

  function openShadesModal(baseHex) {
    if (!shadesModal || !shadesGrid) return;
    const colorName = getColorName(baseHex);
    if (shadesBaseName) shadesBaseName.textContent = `${colorName} (${baseHex}) Tonal Scale`;

    const shades = generateShades(baseHex);
    shadesGrid.innerHTML = '';

    shades.forEach(shade => {
      const textColor = getIdealTextColor(shade.hex);
      const card = document.createElement('div');
      card.className = 'shade-ramp-chip';
      card.style.backgroundColor = shade.hex;
      card.style.color = textColor;
      card.innerHTML = `
        <span class="shade-step-tag">${shade.name}</span>
        <span class="shade-hex-tag">${shade.hex}</span>
      `;
      card.addEventListener('click', () => {
        navigator.clipboard.writeText(shade.hex);
        showToast(`Copied ${shade.name} (${shade.hex})!`);
      });
      shadesGrid.appendChild(card);
    });

    shadesModal.showModal();
  }

  function renderContrastMatrix() {
    if (!matrixContainer) return;
    matrixContainer.innerHTML = '';

    const hexes = slots.map(s => s.hex);
    const table = document.createElement('table');
    table.className = 'matrix-table';

    // Table Header
    let thead = '<thead><tr><th class="matrix-th-corner">Text \\ Bg</th>';
    hexes.forEach((hex, i) => {
      thead += `<th class="matrix-th" style="background:${hex};color:${getIdealTextColor(hex)}">Slot ${i + 1}</th>`;
    });
    thead += '</tr></thead>';

    // Table Body (Rows = Foreground, Columns = Background)
    let tbody = '<tbody>';
    hexes.forEach((fgHex, rIdx) => {
      tbody += `<tr><td class="matrix-td-label" style="background:${fgHex};color:${getIdealTextColor(fgHex)}">Slot ${rIdx + 1}</td>`;
      hexes.forEach((bgHex, cIdx) => {
        if (rIdx === cIdx) {
          tbody += `<td class="matrix-cell identical">—</td>`;
        } else {
          const ratio = getContrastRatio(fgHex, bgHex);
          let grade = 'Fail';
          let badgeClass = 'fail';
          if (ratio >= 7.0) { grade = 'AAA'; badgeClass = 'aaa'; }
          else if (ratio >= 4.5) { grade = 'AA'; badgeClass = 'aa'; }
          else if (ratio >= 3.0) { grade = 'UI Only'; badgeClass = 'ui'; }

          tbody += `
            <td class="matrix-cell" data-fg="${fgHex}" data-bg="${bgHex}" title="Foreground: Slot ${rIdx + 1} (${fgHex}) on Background: Slot ${cIdx + 1} (${bgHex}) — Click to test in Contrast Checker">
              <div class="matrix-cell-content" style="background:${bgHex};color:${fgHex}">
                <span class="matrix-ratio-num">${ratio.toFixed(1)}:1</span>
                <span class="matrix-badge ${badgeClass}">${grade}</span>
              </div>
            </td>
          `;
        }
      });
      tbody += '</tr>';
    });
    tbody += '</tbody>';

    table.innerHTML = thead + tbody;

    // Attach click listeners to matrix cells
    table.querySelectorAll('.matrix-cell:not(.identical)').forEach(cell => {
      cell.addEventListener('click', () => {
        const cellFg = cell.dataset.fg;
        const cellBg = cell.dataset.bg;
        setContrastColors(cellFg, cellBg);
        if (matrixModal) matrixModal.close();
        window.location.hash = 'contrast';
        showToast(`Loaded pairing (${cellFg} on ${cellBg}) into Contrast Checker`);
      });
    });

    matrixContainer.appendChild(table);
  }

  function updateUiSystemPreview() {
    if (!uiPreviewDrawer) return;
    const hexes = slots.map(s => s.hex);
    const primary = hexes[0] || '#6366F1';
    const accent = hexes[1] || '#EC4899';
    const highlight = hexes[2] || '#F59E0B';
    const success = hexes[3] || '#10B981';
    const secondary = hexes[4] || '#3B82F6';

    const brandLogo = document.getElementById('ui-prev-logo');
    const heroBtn = document.getElementById('ui-prev-btn');
    const badge = document.getElementById('ui-prev-badge');
    const card = document.getElementById('ui-prev-card');
    const link = document.getElementById('ui-prev-link');

    if (brandLogo) brandLogo.style.background = `linear-gradient(135deg, ${primary}, ${accent})`;
    if (heroBtn) {
      heroBtn.style.background = primary;
      heroBtn.style.color = getIdealTextColor(primary);
    }
    if (badge) {
      badge.style.background = highlight + '22';
      badge.style.color = highlight;
      badge.style.border = `1px solid ${highlight}55`;
    }
    if (card) {
      card.style.borderColor = secondary + '44';
      card.style.boxShadow = `0 10px 30px -10px ${secondary}33`;
    }
    if (link) link.style.color = success;
  }

  function renderPalette() {
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${slots.length}, 1fr)`;

    slots.forEach((slot, index) => {
      const textColor = getIdealTextColor(slot.hex);
      const isWhiteIdeal = textColor === '#FFFFFF';
      const contrastWithWhite = getContrastRatio(slot.hex, '#FFFFFF');
      const contrastWithBlack = getContrastRatio(slot.hex, '#000000');
      const rgb = hexToRgb(slot.hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const name = getColorName(slot.hex);

      const card = document.createElement('div');
      card.className = 'palette-column group';
      card.style.backgroundColor = slot.hex;
      card.style.color = textColor;

      card.innerHTML = `
        <div class="palette-top-actions">
          <button class="lock-btn ${slot.locked ? 'active' : ''}" 
                  title="${slot.locked ? 'Unlock color' : 'Lock color'}" 
                  aria-label="${slot.locked ? 'Unlock color' : 'Lock color'}"
                  data-index="${index}">
            ${slot.locked 
              ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>'
              : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4"/></svg>'
            }
          </button>

          <div style="display:flex;align-items:center;gap:0.35rem;">
            <button class="check-contrast-bridge-btn" data-hex="${slot.hex}" data-index="${index}" title="Test contrast & accessibility in Contrast Checker">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M12 12 2.1 12A10 10 0 0 0 12 22v-10z"/></svg>
              <span>Contrast</span>
            </button>
            
            <button class="shades-trigger-btn" data-hex="${slot.hex}" title="Explore 10-shade tonal scale">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>Shades</span>
            </button>
          </div>

          <div class="contrast-badge" title="Contrast: ${contrastWithWhite}:1 vs white, ${contrastWithBlack}:1 vs black">
            ${isWhiteIdeal ? 'Aa White' : 'Aa Dark'}
          </div>
        </div>

        <div class="palette-bottom-info">
          <span class="color-creative-name">${name}</span>

          <label class="color-picker-label" title="Click to pick custom color">
            <input type="color" class="hidden-color-input" data-index="${index}" value="${slot.hex}">
            <div class="color-swatch-ring" style="background-color: ${slot.hex}"></div>
          </label>
          
          <button class="hex-copy-btn" data-hex="${slot.hex}" title="Click to copy HEX">
            <span class="hex-text">${slot.hex}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>

          <div class="color-details-row">
            <span class="color-chip-text">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</span>
            <span class="color-chip-text">hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</span>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    // Attach slot listeners
    container.querySelectorAll('.lock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        slots[idx].locked = !slots[idx].locked;
        appState.setSlots(slots);
        renderPalette();
        soundManager.playPop(slots[idx].locked ? 480 : 360);
      });
    });

    // Bridge directly to Contrast Checker
    container.querySelectorAll('.check-contrast-bridge-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.dataset.hex;
        const idx = parseInt(btn.dataset.index, 10);
        const idealBg = getIdealTextColor(hex) === '#FFFFFF' ? '#0F172A' : '#FFFFFF';
        setContrastColors(hex, idealBg, idx);
        window.location.hash = 'contrast';
        soundManager.playClick();
        showToast(`Loaded Slot ${idx + 1} (${hex}) into Contrast Checker!`);
      });
    });

    container.querySelectorAll('.shades-trigger-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playPop(500);
        openShadesModal(btn.dataset.hex);
      });
    });

    container.querySelectorAll('.hidden-color-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(input.dataset.index, 10);
        slots[idx].hex = e.target.value.toUpperCase();
        appState.setSlots(slots);
        renderPalette();
      });
    });

    container.querySelectorAll('.hex-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.dataset.hex;
        navigator.clipboard.writeText(hex);
        soundManager.playCopy();
        showToast(`Copied ${hex} to clipboard!`);
      });
    });

    updateUiSystemPreview();
  }

  function generateNewPalette() {
    const harmony = harmonySelect ? harmonySelect.value : 'random';
    
    const firstLocked = slots.find(s => s.locked);
    let baseH, baseS, baseL;

    if (firstLocked) {
      const rgb = hexToRgb(firstLocked.hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      baseH = hsl.h;
      baseS = hsl.s;
      baseL = hsl.l;
    } else {
      baseH = Math.floor(Math.random() * 360);
      baseS = Math.floor(60 + Math.random() * 35);
      baseL = Math.floor(40 + Math.random() * 25);
    }

    const newHexes = generateHarmonies(baseH, baseS, baseL, harmony, slots.length);

    slots.forEach((slot, idx) => {
      if (!slot.locked) {
        slot.hex = newHexes[idx] || slot.hex;
      }
    });

    appState.setSlots(slots);
    renderPalette();
    soundManager.playPop(520);
  }

  function updateExportCode() {
    if (!exportOutput || !exportFormatSelect) return;
    const format = exportFormatSelect.value;
    const hexes = slots.map(s => s.hex);

    if (format === 'css') {
      exportOutput.value = `:root {\n` +
        hexes.map((hex, i) => `  --color-${i + 1}: ${hex}; /* ${getColorName(hex)} */`).join('\n') +
        `\n}`;
    } else if (format === 'tailwind') {
      exportOutput.value = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n` +
        hexes.map((hex, i) => `        'brand-${(i + 1) * 100}': '${hex}', // ${getColorName(hex)}`).join('\n') +
        `\n      }\n    }\n  }\n};`;
    } else if (format === 'json') {
      const data = hexes.map((hex, i) => {
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return { name: getColorName(hex), hex, rgb, hsl };
      });
      exportOutput.value = JSON.stringify(data, null, 2);
    } else if (format === 'svg') {
      const width = 800;
      const height = 160;
      const colWidth = width / hexes.length;
      let rects = hexes.map((hex, i) => 
        `<rect x="${i * colWidth}" y="0" width="${colWidth}" height="${height}" fill="${hex}"/>\n` +
        `<text x="${i * colWidth + 16}" y="${height - 24}" fill="${getIdealTextColor(hex)}" font-family="sans-serif" font-weight="bold" font-size="14">${hex}</text>`
      ).join('\n');
      exportOutput.value = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n${rects}\n</svg>`;
    }
  }

  function downloadPaletteAsPng() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    const colWidth = canvas.width / slots.length;

    slots.forEach((slot, i) => {
      ctx.fillStyle = slot.hex;
      ctx.fillRect(i * colWidth, 0, colWidth, canvas.height);

      const textColor = getIdealTextColor(slot.hex);
      ctx.fillStyle = textColor;
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(getColorName(slot.hex), i * colWidth + 24, canvas.height - 80);

      ctx.font = 'bold 32px monospace';
      ctx.fillText(slot.hex, i * colWidth + 24, canvas.height - 44);

      const rgb = hexToRgb(slot.hex);
      ctx.font = '16px monospace';
      ctx.fillText(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, i * colWidth + 24, canvas.height - 18);
    });

    const link = document.createElement('a');
    link.download = `pixelcraft-palette-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Palette PNG downloaded!');
  }

  // Subscribe to external state updates
  appState.subscribe((newSlots) => {
    slots = newSlots;
    renderPalette();
  });

  // Contrast Matrix Modal Listener
  if (matrixBtn && matrixModal) {
    matrixBtn.addEventListener('click', () => {
      renderContrastMatrix();
      matrixModal.showModal();
    });
  }

  if (matrixModalClose && matrixModal) {
    matrixModalClose.addEventListener('click', () => {
      matrixModal.close();
    });
  }

  // UI System Preview Drawer Toggle
  if (uiPreviewToggleBtn && uiPreviewDrawer) {
    uiPreviewToggleBtn.addEventListener('click', () => {
      uiPreviewDrawer.classList.toggle('hidden');
      updateUiSystemPreview();
      const isVisible = !uiPreviewDrawer.classList.contains('hidden');
      showToast(isVisible ? 'Showing UI System Preview' : 'Hidden UI System Preview');
    });
  }

  if (uiModeLightBtn && uiModeDarkBtn && uiPreviewDrawer) {
    uiModeLightBtn.addEventListener('click', () => {
      uiPreviewDrawer.classList.remove('theme-dark-preview');
      uiPreviewDrawer.classList.add('theme-light-preview');
      uiModeLightBtn.classList.add('active');
      uiModeDarkBtn.classList.remove('active');
    });
    uiModeDarkBtn.addEventListener('click', () => {
      uiPreviewDrawer.classList.remove('theme-light-preview');
      uiPreviewDrawer.classList.add('theme-dark-preview');
      uiModeDarkBtn.classList.add('active');
      uiModeLightBtn.classList.remove('active');
    });
  }

  // Add / Remove slot listeners
  if (addSlotBtn) {
    addSlotBtn.addEventListener('click', () => {
      if (slots.length >= 7) {
        showToast('Maximum 7 colors allowed');
        return;
      }
      const randomH = Math.floor(Math.random() * 360);
      const newHex = hslToHex(randomH, 70, 50);
      slots.push({ hex: newHex, locked: false });
      appState.setSlots(slots);
      renderPalette();
      showToast(`Added slot (${slots.length} colors)`);
    });
  }

  if (removeSlotBtn) {
    removeSlotBtn.addEventListener('click', () => {
      if (slots.length <= 3) {
        showToast('Minimum 3 colors required');
        return;
      }
      slots.pop();
      appState.setSlots(slots);
      renderPalette();
      showToast(`Removed slot (${slots.length} colors)`);
    });
  }

  // Event Listeners
  if (generateBtn) generateBtn.addEventListener('click', generateNewPalette);
  if (harmonySelect) harmonySelect.addEventListener('change', generateNewPalette);

  // Spacebar to randomize
  window.addEventListener('keydown', (e) => {
    const paletteTabActive = document.querySelector('[data-tool="palette"]')?.classList.contains('active');
    if (paletteTabActive && e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      generateNewPalette();
      showToast('Generated fresh palette (Spacebar)');
    }
  });

  if (exportBtn && exportModal) {
    exportBtn.addEventListener('click', () => {
      updateExportCode();
      exportModal.showModal();
    });
  }

  if (closeModalBtn && exportModal) {
    closeModalBtn.addEventListener('click', () => {
      exportModal.close();
    });
  }

  if (shadesModalClose && shadesModal) {
    shadesModalClose.addEventListener('click', () => {
      shadesModal.close();
    });
  }

  if (exportFormatSelect) exportFormatSelect.addEventListener('change', updateExportCode);
  if (copyExportBtn && exportOutput) {
    copyExportBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(exportOutput.value);
      showToast('Export code copied to clipboard!');
    });
  }

  if (downloadPngBtn) downloadPngBtn.addEventListener('click', downloadPaletteAsPng);

  // Initial render
  renderPalette();
}
