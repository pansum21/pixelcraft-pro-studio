/**
 * Favicon & App Icon Pack Studio Tool
 * Generates pixel-perfect icons across all web and mobile resolutions
 * (16x16, 32x32, 180x180, 512x512) with shape masks and HTML link snippets.
 */

import { appState } from '../state.js';

export function initFaviconTool(showToast) {
  const fileInput = document.getElementById('favicon-file-input');
  const dropZone = document.getElementById('favicon-drop-zone');
  const shapeSelect = document.getElementById('favicon-shape-select');
  const bgTypeSelect = document.getElementById('favicon-bg-select');
  const bgColorPicker = document.getElementById('favicon-bg-picker');
  const importPaletteBtn = document.getElementById('favicon-import-palette-btn');
  const paddingSlider = document.getElementById('favicon-padding-slider');
  const paddingVal = document.getElementById('favicon-padding-val');
  const copyHtmlBtn = document.getElementById('favicon-copy-html-btn');
  const downloadAllBtn = document.getElementById('favicon-download-all-btn');

  // Preview elements
  const prev16 = document.getElementById('favicon-prev-16');
  const prev32 = document.getElementById('favicon-prev-32');
  const prev180 = document.getElementById('favicon-prev-180');
  const prev512 = document.getElementById('favicon-prev-512');
  const tabMockupIcon = document.getElementById('favicon-tab-mockup-icon');

  let currentSourceImage = null;

  // Default sample logo SVG
  const defaultSampleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="favg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%236366F1"/><stop offset="100%" stop-color="%23EC4899"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(%23favg)"/><path d="M50 20 L75 75 L50 60 L25 75 Z" fill="%23ffffff"/></svg>`;

  function renderToCanvas(size, shape, bgType, bgColor, iconPadding) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clipping path for shape mask
    ctx.save();
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
    } else if (shape === 'rounded') {
      const radius = size * 0.22;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, radius);
      ctx.clip();
    }

    // Background fill
    if (bgType === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
    } else if (bgType === 'palette') {
      const hexes = appState.getHexes();
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, hexes[0] || '#6366F1');
      grad.addColorStop(1, hexes[hexes.length - 1] || '#EC4899');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }

    // Draw Source Image
    if (currentSourceImage) {
      const pad = (iconPadding / 100) * size;
      const drawSize = size - (pad * 2);
      ctx.drawImage(currentSourceImage, pad, pad, drawSize, drawSize);
    }
    ctx.restore();

    return canvas;
  }

  function updateAllIcons() {
    const shape = shapeSelect ? shapeSelect.value : 'rounded';
    const bgType = bgTypeSelect ? bgTypeSelect.value : 'palette';
    const bgColor = bgColorPicker ? bgColorPicker.value : '#090D16';
    const pad = parseInt(paddingSlider ? paddingSlider.value : '15', 10);
    if (paddingVal) paddingVal.textContent = `${pad}%`;

    const c16 = renderToCanvas(16, shape, bgType, bgColor, pad);
    const c32 = renderToCanvas(32, shape, bgType, bgColor, pad);
    const c180 = renderToCanvas(180, shape, bgType, bgColor, pad);
    const c512 = renderToCanvas(512, shape, bgType, bgColor, pad);

    if (prev16) prev16.src = c16.toDataURL();
    if (prev32) prev32.src = c32.toDataURL();
    if (prev180) prev180.src = c180.toDataURL();
    if (prev512) prev512.src = c512.toDataURL();
    if (tabMockupIcon) tabMockupIcon.src = c32.toDataURL();
  }

  function loadSource(srcUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      currentSourceImage = img;
      updateAllIcons();
    };
    img.src = srcUrl;
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please upload a valid image (PNG, SVG, JPG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      loadSource(e.target.result);
      showToast(`Loaded icon source: ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  function downloadIcon(size, filename) {
    const shape = shapeSelect ? shapeSelect.value : 'rounded';
    const bgType = bgTypeSelect ? bgTypeSelect.value : 'palette';
    const bgColor = bgColorPicker ? bgColorPicker.value : '#090D16';
    const pad = parseInt(paddingSlider ? paddingSlider.value : '15', 10);

    const canvas = renderToCanvas(size, shape, bgType, bgColor, pad);
    const a = document.createElement('a');
    a.download = filename;
    a.href = canvas.toDataURL('image/png');
    a.click();
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

  if (shapeSelect) shapeSelect.addEventListener('change', updateAllIcons);
  if (bgTypeSelect) {
    bgTypeSelect.addEventListener('change', () => {
      if (bgColorPicker) {
        bgColorPicker.style.display = bgTypeSelect.value === 'solid' ? 'inline-block' : 'none';
      }
      updateAllIcons();
    });
  }
  if (bgColorPicker) bgColorPicker.addEventListener('input', updateAllIcons);
  if (paddingSlider) paddingSlider.addEventListener('input', updateAllIcons);

  if (importPaletteBtn) {
    importPaletteBtn.addEventListener('click', () => {
      if (bgTypeSelect) bgTypeSelect.value = 'palette';
      updateAllIcons();
      showToast('Set icon background to Active Palette gradient!');
    });
  }

  if (copyHtmlBtn) {
    copyHtmlBtn.addEventListener('click', () => {
      const htmlSnippet = `<!-- Favicon & App Icons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">`;
      navigator.clipboard.writeText(htmlSnippet);
      showToast('Copied HTML link tags to clipboard!');
    });
  }

  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', () => {
      downloadIcon(16, 'favicon-16x16.png');
      setTimeout(() => downloadIcon(32, 'favicon-32x32.png'), 150);
      setTimeout(() => downloadIcon(180, 'apple-touch-icon.png'), 300);
      setTimeout(() => downloadIcon(512, 'android-chrome-512x512.png'), 450);
      showToast('Downloading all icon resolutions!');
    });
  }

  // Load sample default icon
  loadSource(defaultSampleSvg);
}
