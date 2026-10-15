/**
 * SVG Wave & Shape Divider Studio Tool
 * Generates customizable bezier waves and layered organic section dividers.
 * Supports multi-layer depth, flip axes, active palette coloring,
 * and 1-click SVG/CSS export.
 */

import { appState } from '../state.js';

export function initWaveTool(showToast) {
  const waveLayersSlider = document.getElementById('wave-layers-slider');
  const waveLayersVal = document.getElementById('wave-layers-val');
  const waveHeightSlider = document.getElementById('wave-height-slider');
  const waveHeightVal = document.getElementById('wave-height-val');
  const wavePointsSlider = document.getElementById('wave-points-slider');
  const wavePointsVal = document.getElementById('wave-points-val');
  const flipHCheckbox = document.getElementById('wave-flip-h');
  const flipVCheckbox = document.getElementById('wave-flip-v');
  const randomizeBtn = document.getElementById('wave-randomize-btn');
  const importPaletteBtn = document.getElementById('wave-import-palette-btn');
  const copySvgBtn = document.getElementById('wave-copy-svg-btn');
  const downloadSvgBtn = document.getElementById('wave-download-svg-btn');
  const previewBox = document.getElementById('wave-preview-box');
  const codeOutput = document.getElementById('wave-code-output');

  let baseColor = '#6366F1';
  let seedPoints = [];

  function generatePoints(count, height) {
    const points = [];
    for (let i = 0; i <= count; i++) {
      const x = Math.round((i / count) * 1440);
      // Generate varying heights
      const variance = (Math.sin(i * 1.5) + (Math.random() - 0.5) * 0.8);
      const y = Math.max(20, Math.min(380, Math.round(height * 0.5 + variance * (height * 0.4))));
      points.push({ x, y });
    }
    return points;
  }

  function rerollSeed() {
    const count = parseInt(wavePointsSlider ? wavePointsSlider.value : '4', 10);
    const height = parseInt(waveHeightSlider ? waveHeightSlider.value : '160', 10);
    seedPoints = generatePoints(count, height);
  }

  function createBezierPath(points, totalHeight = 320) {
    let d = `M 0,${totalHeight} L ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;
      d += ` Q ${p0.x},${p0.y} ${midX},${midY}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x},${last.y} L 1440,${totalHeight} Z`;
    return d;
  }

  function renderWave() {
    if (!previewBox) return;

    const layersCount = parseInt(waveLayersSlider ? waveLayersSlider.value : '2', 10);
    const height = parseInt(waveHeightSlider ? waveHeightSlider.value : '160', 10);
    const flipH = flipHCheckbox ? flipHCheckbox.checked : false;
    const flipV = flipVCheckbox ? flipVCheckbox.checked : false;

    if (seedPoints.length === 0) {
      rerollSeed();
    }

    const palette = appState.getHexes();
    const svgTotalHeight = 320;
    let pathsHtml = '';

    const transforms = [];
    if (flipH) transforms.push('scale(-1, 1) translate(-1440, 0)');
    if (flipV) transforms.push('scale(1, -1) translate(0, -320)');
    const transformAttr = transforms.length > 0 ? `transform="${transforms.join(' ')}"` : '';

    for (let l = layersCount - 1; l >= 0; l--) {
      const layerOffset = l * 28;
      const opacity = (1 - (l * 0.22)).toFixed(2);
      const layerColor = palette[l % palette.length] || baseColor;

      // Shift points slightly per layer for realistic depth
      const shiftedPoints = seedPoints.map((p, idx) => ({
        x: p.x,
        y: Math.max(10, p.y + layerOffset * (idx % 2 === 0 ? 0.8 : -0.5))
      }));

      const d = createBezierPath(shiftedPoints, svgTotalHeight);
      pathsHtml += `<path d="${d}" fill="${layerColor}" fill-opacity="${opacity}" />\n  `;
    }

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" width="100%" height="100%" preserveAspectRatio="none">
  <g ${transformAttr}>
  ${pathsHtml}</g>
</svg>`;

    previewBox.innerHTML = svgContent;
    if (codeOutput) {
      codeOutput.value = svgContent.trim();
    }
  }

  // Event Listeners
  if (waveHeightSlider) {
    waveHeightSlider.addEventListener('input', (e) => {
      if (waveHeightVal) waveHeightVal.textContent = `${e.target.value}px`;
      rerollSeed();
      renderWave();
    });
  }

  if (wavePointsSlider) {
    wavePointsSlider.addEventListener('input', (e) => {
      if (wavePointsVal) wavePointsVal.textContent = e.target.value;
      rerollSeed();
      renderWave();
    });
  }

  if (waveLayersSlider) {
    waveLayersSlider.addEventListener('input', (e) => {
      if (waveLayersVal) waveLayersVal.textContent = e.target.value;
      renderWave();
    });
  }

  if (flipHCheckbox) flipHCheckbox.addEventListener('change', renderWave);
  if (flipVCheckbox) flipVCheckbox.addEventListener('change', renderWave);

  if (randomizeBtn) {
    randomizeBtn.addEventListener('click', () => {
      rerollSeed();
      renderWave();
      showToast('Generated fresh wave curve!');
    });
  }

  if (importPaletteBtn) {
    importPaletteBtn.addEventListener('click', () => {
      renderWave();
      showToast('Styled wave layers with Active Palette!');
    });
  }

  if (copySvgBtn && codeOutput) {
    copySvgBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeOutput.value);
      showToast('Copied SVG code to clipboard!');
    });
  }

  if (downloadSvgBtn && codeOutput) {
    downloadSvgBtn.addEventListener('click', () => {
      const blob = new Blob([codeOutput.value], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pixelcraft-wave-divider.svg';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded .SVG wave divider!');
    });
  }

  // Initial render
  rerollSeed();
  renderWave();
}
