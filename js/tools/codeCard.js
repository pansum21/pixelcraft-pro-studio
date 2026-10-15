/**
 * Code & Text to Beautiful Image Card Tool (Ray.so / Carbon Style)
 * Renders syntax text inside a macOS glassmorphism window frame
 * with customizable mesh gradients, typography, and high-res PNG export.
 */

import { appState } from '../state.js';

export function initCodeCardTool(showToast) {
  const codeEditor = document.getElementById('codecard-textarea');
  const titleInput = document.getElementById('codecard-title-input');
  const paddingSlider = document.getElementById('codecard-padding-slider');
  const paddingVal = document.getElementById('codecard-padding-val');
  const themeSelect = document.getElementById('codecard-theme-select');
  const lineNumbersCheck = document.getElementById('codecard-linenums-check');
  const exportScaleSelect = document.getElementById('codecard-export-scale');
  const exportPngBtn = document.getElementById('codecard-export-png-btn');
  const copyPngBtn = document.getElementById('codecard-copy-png-btn');
  const importPaletteBtn = document.getElementById('codecard-import-palette-btn');

  // Preview elements
  const stage = document.getElementById('codecard-preview-stage');
  const windowFrame = document.getElementById('codecard-window-frame');
  const windowTitle = document.getElementById('codecard-window-title');
  const codeDisplay = document.getElementById('codecard-code-display');

  const defaultCode = `// PixelCraft Design System v3.0
import { createDesignSystem } from 'pixelcraft';

export const modernPalette = createDesignSystem({
  aesthetic: 'glassmorphism',
  contrastCheck: 'WCAG AAA (7.0:1)',
  theme: 'obsidian-glow',
  export: ['CSS', 'Tailwind', 'SVG']
});`;

  let currentBackdrop = 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)';

  function updateCardPreview() {
    if (!stage || !windowFrame || !codeDisplay) return;

    // Title
    if (windowTitle && titleInput) {
      windowTitle.textContent = titleInput.value.trim() || 'untitled.js';
    }

    // Padding
    const pad = paddingSlider ? paddingSlider.value : '40';
    if (paddingVal) paddingVal.textContent = `${pad}px`;
    stage.style.padding = `${pad}px`;

    // Backdrop
    stage.style.background = currentBackdrop;

    // Theme
    const theme = themeSelect ? themeSelect.value : 'dark';
    windowFrame.className = `codecard-window theme-${theme}`;

    // Code & Line Numbers
    const rawCode = codeEditor ? codeEditor.value : defaultCode;
    const lines = rawCode.split('\n');
    const showLines = lineNumbersCheck ? lineNumbersCheck.checked : true;

    codeDisplay.innerHTML = '';
    lines.forEach((lineText, idx) => {
      const lineRow = document.createElement('div');
      lineRow.className = 'code-line-row';

      if (showLines) {
        const numSpan = document.createElement('span');
        numSpan.className = 'code-line-num';
        numSpan.textContent = idx + 1;
        lineRow.appendChild(numSpan);
      }

      const textSpan = document.createElement('span');
      textSpan.className = 'code-line-text';
      textSpan.textContent = lineText || ' ';
      lineRow.appendChild(textSpan);

      codeDisplay.appendChild(lineRow);
    });
  }

  function exportAsPng(isClipboard = false) {
    if (!stage) return;
    const scale = parseInt(exportScaleSelect ? exportScaleSelect.value : '2', 10);

    // Render using Canvas
    const width = stage.offsetWidth;
    const height = stage.offsetHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Create SVG snapshot via foreignObject
    const clone = stage.cloneNode(true);
    clone.style.transform = 'none';

    // Inline computed styles
    const data = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <style>
              .codecard-stage { display:flex;align-items:center;justify-content:center;border-radius:24px;font-family:'JetBrains Mono',monospace; }
              .codecard-window { border-radius:16px;box-shadow:0 30px 60px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.18);overflow:hidden;min-width:420px; }
              .codecard-window.theme-dark { background:rgba(13,18,30,0.95);color:#f8fafc; }
              .codecard-window.theme-minimal { background:#090d16;color:#ffffff;border-color:rgba(255,255,255,0.1); }
              .codecard-window.theme-light { background:#ffffff;color:#0f172a;border-color:rgba(0,0,0,0.1); }
              .codecard-traffic-lights { display:flex;align-items:center;gap:6px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(0,0,0,0.2); }
              .codecard-dot { width:11px;height:11px;border-radius:50%; }
              .codecard-dot.red { background:#ff5f56; }
              .codecard-dot.yellow { background:#ffbd2e; }
              .codecard-dot.green { background:#27c93f; }
              .codecard-title { margin-left:auto;margin-right:auto;font-size:0.75rem;font-weight:700;opacity:0.7; }
              .codecard-body { padding:18px 22px;font-size:0.9rem;line-height:1.6; }
              .code-line-row { display:flex;gap:16px; }
              .code-line-num { opacity:0.35;user-select:none;min-width:24px;text-align:right; }
              .code-line-text { white-space:pre-wrap;word-break:break-word; }
            </style>
            ${clone.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      if (isClipboard && navigator.clipboard && window.ClipboardItem) {
        canvas.toBlob(blob => {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            .then(() => showToast('Image copied to clipboard!'))
            .catch(() => downloadCanvas(canvas));
        });
      } else {
        downloadCanvas(canvas);
      }
    };
    img.src = url;
  }

  function downloadCanvas(canvas) {
    const a = document.createElement('a');
    a.download = `pixelcraft-card-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast('Downloaded High-Res PNG Card!');
  }

  // Event Listeners
  if (codeEditor) {
    codeEditor.value = defaultCode;
    codeEditor.addEventListener('input', updateCardPreview);
  }

  if (titleInput) titleInput.addEventListener('input', updateCardPreview);
  if (paddingSlider) paddingSlider.addEventListener('input', updateCardPreview);
  if (themeSelect) themeSelect.addEventListener('change', updateCardPreview);
  if (lineNumbersCheck) lineNumbersCheck.addEventListener('change', updateCardPreview);

  if (importPaletteBtn) {
    importPaletteBtn.addEventListener('click', () => {
      const hexes = appState.getHexes();
      if (hexes && hexes.length >= 2) {
        currentBackdrop = `linear-gradient(135deg, ${hexes[0]} 0%, ${hexes[Math.floor(hexes.length / 2)]} 50%, ${hexes[hexes.length - 1]} 100%)`;
        updateCardPreview();
        showToast('Set card backdrop using Active Palette!');
      }
    });
  }

  if (exportPngBtn) exportPngBtn.addEventListener('click', () => exportAsPng(false));
  if (copyPngBtn) copyPngBtn.addEventListener('click', () => exportAsPng(true));

  // Presets
  document.querySelectorAll('.codecard-bg-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      currentBackdrop = btn.dataset.gradient;
      updateCardPreview();
    });
  });

  // Initial render
  updateCardPreview();
}
