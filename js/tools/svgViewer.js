/**
 * SVG Viewer & Optimizer Tool
 * Inspects SVG code, renders with zoom/pan, cleans redundant metadata,
 * generates Data URIs, and exports as high-res PNG.
 */

import { appState } from '../state.js';

export function initSvgTool(showToast) {
  const fileInput = document.getElementById('svg-file-input');
  const dropZone = document.getElementById('svg-drop-zone');
  const codeInput = document.getElementById('svg-code-input');
  const previewContainer = document.getElementById('svg-preview-container');
  const previewCanvas = document.getElementById('svg-preview-canvas');

  // Stats elements
  const statOriginalSize = document.getElementById('svg-stat-orig-size');
  const statCleanedSize = document.getElementById('svg-stat-clean-size');
  const statSavings = document.getElementById('svg-stat-savings');
  const statDimensions = document.getElementById('svg-stat-dimensions');
  const statNodes = document.getElementById('svg-stat-nodes');

  // Action buttons
  const optimizeBtn = document.getElementById('svg-optimize-btn');
  const recolorPaletteBtn = document.getElementById('svg-recolor-palette-btn');
  const copySvgBtn = document.getElementById('svg-copy-btn');
  const downloadSvgBtn = document.getElementById('svg-download-btn');
  const exportPngBtn = document.getElementById('svg-export-png-btn');
  const copyDataUriBtn = document.getElementById('svg-copy-datauri-btn');
  const sampleBtns = document.querySelectorAll('.svg-sample-btn');

  // View controls
  const bgLightBtn = document.getElementById('svg-bg-light');
  const bgDarkBtn = document.getElementById('svg-bg-dark');
  const bgCheckerBtn = document.getElementById('svg-bg-checker');
  const zoomInBtn = document.getElementById('svg-zoom-in');
  const zoomOutBtn = document.getElementById('svg-zoom-out');
  const zoomResetBtn = document.getElementById('svg-zoom-reset');
  const pngScaleSelect = document.getElementById('svg-png-scale');

  let currentRawSvg = '';
  let currentCleanSvg = '';
  let zoomLevel = 1.0;
  let isPanning = false;
  let startX = 0, startY = 0;
  let panX = 0, panY = 0;

  const sampleSvgs = {
    rocket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="160" height="160" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- Modern Rocket Illustration -->
  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#F59E0B" stroke="#D97706"/>
  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="#6366F1" stroke="#4F46E5"/>
  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" fill="#818CF8" stroke="#4F46E5"/>
  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" fill="#818CF8" stroke="#4F46E5"/>
  <circle cx="15.5" cy="8.5" r="2.5" fill="#FFFFFF" stroke="#4F46E5"/>
</svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="160" height="160" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#shieldGrad)" stroke="#047857"/>
  <path d="m9 12 2 2 4-4" stroke="#FFFFFF" stroke-width="2.5"/>
</svg>`,
    badge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="160" height="160" fill="none">
  <circle cx="12" cy="12" r="10" fill="#EC4899" />
  <path d="M12 6v12M6 12h12" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
</svg>`
  };

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  function cleanAndOptimizeSvg(svgString) {
    let clean = svgString;
    // Strip XML declaration
    clean = clean.replace(/<\?xml[^>]*\?>/gi, '');
    // Strip DOCTYPE
    clean = clean.replace(/<!DOCTYPE[^>]*>/gi, '');
    // Strip comments
    clean = clean.replace(/<!--[\s\S]*?-->/g, '');
    // Strip editor namespaces and generator metadata
    clean = clean.replace(/\s*xmlns:(?:inkscape|sodipodi|sketch|adobe|i|graph)="[^"]*"/gi, '');
    clean = clean.replace(/\s*(?:inkscape|sodipodi|sketch|adobe):[a-z0-9_-]+="[^"]*"/gi, '');
    clean = clean.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    // Strip redundant whitespace
    clean = clean.replace(/>\s+</g, '><').trim();

    return clean;
  }

  function parseSvgMetrics(svgString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');

    if (!svgEl || doc.querySelector('parsererror')) {
      return null;
    }

    const viewBox = svgEl.getAttribute('viewBox') || 'None';
    const width = svgEl.getAttribute('width') || 'auto';
    const height = svgEl.getAttribute('height') || 'auto';
    const allElements = doc.querySelectorAll('*').length;

    return {
      svgEl,
      viewBox,
      width,
      height,
      nodeCount: allElements
    };
  }

  function applyTransform() {
    if (previewCanvas) {
      previewCanvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    }
  }

  function renderSvg(rawSvg, forceOptimize = false) {
    if (!rawSvg.trim()) return;

    currentRawSvg = rawSvg;
    currentCleanSvg = forceOptimize ? cleanAndOptimizeSvg(rawSvg) : rawSvg;

    const metrics = parseSvgMetrics(currentCleanSvg);
    if (!metrics) {
      showToast('Invalid SVG markup. Please check your syntax.');
      return;
    }

    // Update metrics UI
    const origBytes = new Blob([currentRawSvg]).size;
    const cleanBytes = new Blob([currentCleanSvg]).size;
    const savings = Math.max(0, Math.round(((origBytes - cleanBytes) / origBytes) * 100));

    if (statOriginalSize) statOriginalSize.textContent = formatBytes(origBytes);
    if (statCleanedSize) statCleanedSize.textContent = formatBytes(cleanBytes);
    if (statSavings) statSavings.textContent = `${savings}% saved`;
    if (statDimensions) statDimensions.textContent = metrics.viewBox !== 'None' ? metrics.viewBox : `${metrics.width} × ${metrics.height}`;
    if (statNodes) statNodes.textContent = `${metrics.nodeCount} elements`;

    if (previewCanvas) {
      previewCanvas.innerHTML = currentCleanSvg;
    }

    if (codeInput && forceOptimize) {
      codeInput.value = currentCleanSvg;
    }
  }

  // Setup Pan and Zoom
  if (previewContainer) {
    previewContainer.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      isPanning = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      previewContainer.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      applyTransform();
    });

    window.addEventListener('mouseup', () => {
      isPanning = false;
      if (previewContainer) previewContainer.style.cursor = 'grab';
    });

    previewContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      zoomLevel = Math.max(0.2, Math.min(5.0, zoomLevel + delta));
      applyTransform();
    }, { passive: false });
  }

  // Zoom buttons
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      zoomLevel = Math.min(5.0, zoomLevel + 0.25);
      applyTransform();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      zoomLevel = Math.max(0.2, zoomLevel - 0.25);
      applyTransform();
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => {
      zoomLevel = 1.0;
      panX = 0;
      panY = 0;
      applyTransform();
    });
  }

  // Background toggle buttons
  if (bgLightBtn && bgDarkBtn && bgCheckerBtn && previewContainer) {
    bgLightBtn.addEventListener('click', () => {
      previewContainer.className = 'svg-preview-viewport bg-light';
      showToast('Light background');
    });
    bgDarkBtn.addEventListener('click', () => {
      previewContainer.className = 'svg-preview-viewport bg-dark';
      showToast('Dark background');
    });
    bgCheckerBtn.addEventListener('click', () => {
      previewContainer.className = 'svg-preview-viewport bg-checker';
      showToast('Checkerboard background');
    });
  }

  // Drag and drop / file input
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
        loadFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        loadFile(e.target.files[0]);
      }
    });
  }

  function loadFile(file) {
    if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
      showToast('Please upload a valid .svg file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (codeInput) codeInput.value = text;
      renderSvg(text, false);
      showToast(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  }

  // Code input change
  if (codeInput) {
    codeInput.addEventListener('input', (e) => {
      renderSvg(e.target.value, false);
    });
  }

  // Optimize Button
  if (optimizeBtn) {
    optimizeBtn.addEventListener('click', () => {
      if (!currentRawSvg) {
        showToast('Load an SVG first');
        return;
      }
      renderSvg(currentRawSvg, true);
      showToast('SVG successfully cleaned & optimized!');
    });
  }

  // Recolor with Active Palette Button
  if (recolorPaletteBtn) {
    recolorPaletteBtn.addEventListener('click', () => {
      const hexes = appState.getHexes();
      const currentSvg = currentCleanSvg || currentRawSvg;
      if (!currentSvg || hexes.length === 0) {
        showToast('Load an SVG first');
        return;
      }

      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(currentSvg, 'image/svg+xml');
        const coloredElements = doc.querySelectorAll('path, circle, rect, polygon, ellipse');

        let colorIdx = 0;
        coloredElements.forEach(el => {
          const fill = el.getAttribute('fill');
          const stroke = el.getAttribute('stroke');
          if (fill && fill !== 'none' && fill !== 'transparent') {
            el.setAttribute('fill', hexes[colorIdx % hexes.length]);
            colorIdx++;
          }
          if (stroke && stroke !== 'none' && stroke !== 'transparent') {
            el.setAttribute('stroke', hexes[(colorIdx + 1) % hexes.length]);
          }
        });

        const s = new XMLSerializer();
        const newSvgStr = s.serializeToString(doc.documentElement);
        if (codeInput) codeInput.value = newSvgStr;
        renderSvg(newSvgStr, false);
        showToast('Recolored SVG using active Palette!');
      } catch (err) {
        console.error('Error recoloring SVG:', err);
        showToast('Could not recolor SVG.');
      }
    });
  }

  // Copy SVG Button
  if (copySvgBtn) {
    copySvgBtn.addEventListener('click', () => {
      const text = currentCleanSvg || currentRawSvg;
      if (!text) {
        showToast('No SVG content to copy');
        return;
      }
      navigator.clipboard.writeText(text);
      showToast('SVG code copied to clipboard!');
    });
  }

  // Download SVG Button
  if (downloadSvgBtn) {
    downloadSvgBtn.addEventListener('click', () => {
      const text = currentCleanSvg || currentRawSvg;
      if (!text) return;
      const blob = new Blob([text], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `optimized-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('SVG file downloaded!');
    });
  }

  // Copy Data URI Button
  if (copyDataUriBtn) {
    copyDataUriBtn.addEventListener('click', () => {
      const text = currentCleanSvg || currentRawSvg;
      if (!text) return;
      const encoded = encodeURIComponent(text).replace(/'/g, '%27').replace(/"/g, '%22');
      const dataUri = `data:image/svg+xml;charset=utf-8,${encoded}`;
      navigator.clipboard.writeText(dataUri);
      showToast('SVG Data URI copied to clipboard!');
    });
  }

  // Export as PNG
  if (exportPngBtn) {
    exportPngBtn.addEventListener('click', () => {
      const text = currentCleanSvg || currentRawSvg;
      if (!text) return;

      const scale = pngScaleSelect ? parseFloat(pngScaleSelect.value) : 2;
      const metrics = parseSvgMetrics(text);
      if (!metrics) return;

      const img = new Image();
      const blob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        let baseW = img.width || 300;
        let baseH = img.height || 300;

        if (metrics.viewBox && metrics.viewBox !== 'None') {
          const parts = metrics.viewBox.split(/[\s,]+/).map(Number);
          if (parts.length === 4) {
            baseW = parts[2];
            baseH = parts[3];
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = baseW * scale;
        canvas.height = baseH * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `svg-export-${scale}x.png`;
        link.click();

        URL.revokeObjectURL(url);
        showToast(`Exported PNG at ${scale}x (${canvas.width}×${canvas.height}px)`);
      };

      img.src = url;
    });
  }

  // Sample Buttons
  sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sample;
      if (sampleSvgs[key]) {
        if (codeInput) codeInput.value = sampleSvgs[key];
        renderSvg(sampleSvgs[key], false);
        showToast(`Loaded ${key} sample`);
      }
    });
  });

  // Initial sample load
  if (sampleSvgs.rocket) {
    if (codeInput) codeInput.value = sampleSvgs.rocket;
    renderSvg(sampleSvgs.rocket, false);
  }
}
