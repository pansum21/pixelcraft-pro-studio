/**
 * Image to Color Palette Extractor Tool
 * Extracts dominant aesthetic colors from any uploaded or dropped image
 * using client-side Canvas pixel quantization.
 * Direct 1-click bridge to push extracted colors into the Active Palette.
 */

import { appState } from '../state.js';
import { rgbToHex, getIdealTextColor, getColorName } from '../utils/colorUtils.js';

export function initExtractorTool(showToast) {
  const fileInput = document.getElementById('extractor-file-input');
  const dropZone = document.getElementById('extractor-drop-zone');
  const previewImg = document.getElementById('extractor-preview-img');
  const swatchesGrid = document.getElementById('extractor-swatches-grid');
  const applyPaletteBtn = document.getElementById('extractor-apply-palette-btn');
  const sampleBtns = document.querySelectorAll('.extractor-sample-btn');
  const colorCountSelect = document.getElementById('extractor-color-count');

  let extractedHexes = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

  const sampleImages = {
    nature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230f2027"/><stop offset="50%" stop-color="%23203a43"/><stop offset="100%" stop-color="%232c5364"/></linearGradient><linearGradient id="g2" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="%2311998e"/><stop offset="100%" stop-color="%2338ef7d"/></linearGradient></defs><rect width="600" height="400" fill="url(%23g1)"/><circle cx="480" cy="90" r="45" fill="%23f6d365"/><polygon points="0,400 180,240 320,340 460,200 600,400" fill="url(%23g2)" opacity="0.85"/><polygon points="120,400 280,280 400,380 600,260 600,400" fill="%230575E6" opacity="0.6"/></svg>',
    cyberpunk: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2309090e"/><stop offset="100%" stop-color="%23160e29"/></linearGradient></defs><rect width="600" height="400" fill="url(%23cg)"/><circle cx="300" cy="200" r="110" fill="none" stroke="%23ff007f" stroke-width="12" opacity="0.9"/><polygon points="200,320 300,140 400,320" fill="%2300f0ff" opacity="0.75"/><rect x="80" y="80" width="100" height="100" rx="20" fill="%23ffe600" opacity="0.8"/><circle cx="500" cy="280" r="40" fill="%237928ca"/></svg>',
    sunset: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23ff7e5f"/><stop offset="50%" stop-color="%23feb47b"/><stop offset="100%" stop-color="%235f2c82"/></linearGradient></defs><rect width="600" height="400" fill="url(%23sg)"/><circle cx="300" cy="220" r="75" fill="%23fff" opacity="0.9"/><rect y="280" width="600" height="120" fill="%232b1055" opacity="0.95"/></svg>'
  };

  function extractColorsFromImage(imgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const targetSize = 120; // scale down for speed
    canvas.width = targetSize;
    canvas.height = targetSize;

    ctx.drawImage(imgElement, 0, 0, targetSize, targetSize);
    let imgData;
    try {
      imgData = ctx.getImageData(0, 0, targetSize, targetSize).data;
    } catch (e) {
      console.warn('Canvas security restriction:', e);
      return;
    }

    const colorBins = {};
    const step = 4 * 3; // sample every 3rd pixel

    for (let i = 0; i < imgData.length; i += step) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      if (a < 128) continue; // skip transparent

      // Quantize to bins of 24 to group similar colors
      const qr = Math.round(r / 24) * 24;
      const qg = Math.round(g / 24) * 24;
      const qb = Math.round(b / 24) * 24;

      const key = `${qr},${qg},${qb}`;
      if (!colorBins[key]) {
        colorBins[key] = { r: qr, g: qg, b: qb, count: 0 };
      }
      colorBins[key].count++;
    }

    // Sort bins by frequency
    const sortedBins = Object.values(colorBins).sort((a, b) => b.count - a.count);
    const count = parseInt(colorCountSelect ? colorCountSelect.value : '5', 10);
    const selected = [];

    // Filter out visually identical colors
    for (const bin of sortedBins) {
      if (selected.length >= count) break;
      const hex = rgbToHex(bin.r, bin.g, bin.b);

      const isTooClose = selected.some(existing => {
        const dR = Math.abs(existing.r - bin.r);
        const dG = Math.abs(existing.g - bin.g);
        const dB = Math.abs(existing.b - bin.b);
        return (dR + dG + dB) < 65; // color distance threshold
      });

      if (!isTooClose) {
        selected.push({ hex, r: bin.r, g: bin.g, b: bin.b });
      }
    }

    // Fallback if image has very few distinct colors
    while (selected.length < count && sortedBins[selected.length]) {
      const b = sortedBins[selected.length];
      selected.push({ hex: rgbToHex(b.r, b.g, b.b), r: b.r, g: b.g, b: b.b });
    }

    extractedHexes = selected.map(s => s.hex);
    renderExtractedSwatches();
  }

  function renderExtractedSwatches() {
    if (!swatchesGrid) return;
    swatchesGrid.innerHTML = '';

    extractedHexes.forEach((hex, idx) => {
      const card = document.createElement('div');
      card.className = 'extractor-swatch-card';
      const textColor = getIdealTextColor(hex);
      const name = getColorName(hex);

      card.style.backgroundColor = hex;
      card.style.color = textColor;
      card.innerHTML = `
        <div class="swatch-card-header">
          <span class="swatch-idx">#0${idx + 1}</span>
          <button class="swatch-copy-btn" title="Copy HEX">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div class="swatch-card-footer">
          <span class="swatch-hex">${hex}</span>
          <span class="swatch-name">${name}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        navigator.clipboard.writeText(hex);
        showToast(`Copied ${hex} (${name})`);
      });

      swatchesGrid.appendChild(card);
    });
  }

  function loadSample(key) {
    if (!sampleImages[key] || !previewImg) return;
    previewImg.src = sampleImages[key];
    previewImg.onload = () => {
      extractColorsFromImage(previewImg);
      showToast(`Extracted palette from ${key} sample!`);
    };
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (previewImg) {
        previewImg.src = e.target.result;
        previewImg.onload = () => {
          extractColorsFromImage(previewImg);
          showToast(`Extracted ${extractedHexes.length} colors from ${file.name}!`);
        };
      }
    };
    reader.readAsDataURL(file);
  }

  // Event Listeners
  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });
  }

  sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sample = btn.dataset.sample;
      loadSample(sample);
    });
  });

  if (colorCountSelect) {
    colorCountSelect.addEventListener('change', () => {
      if (previewImg && previewImg.complete) {
        extractColorsFromImage(previewImg);
      }
    });
  }

  if (applyPaletteBtn) {
    applyPaletteBtn.addEventListener('click', () => {
      if (extractedHexes.length > 0) {
        const newSlots = extractedHexes.map(hex => ({ hex, locked: false }));
        appState.setSlots(newSlots);
        window.location.hash = 'palette';
        showToast(`Loaded ${newSlots.length} extracted colors into Active Palette!`);
      }
    });
  }

  // Initial load
  loadSample('nature');
}
