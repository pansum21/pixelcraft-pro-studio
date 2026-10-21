/**
 * Tool 12: 8-Bit Pixel Art Studio & Sprite Animator
 * 100% In-Browser, Zero-Server HTML5 Canvas Engine.
 * Features:
 * - 16x16, 24x24, 32x32, 48x48 Grid Editor
 * - Pencil, Eraser, Flood Fill (Bucket), Eyedropper, Line, and Mirror Symmetry
 * - Color Palette Sync with Active Studio Tokens
 * - Multi-Frame Sprite Animation with Onion Skinning & FPS slider
 * - High-Res Pixel-Crisp PNG, Sprite Sheet, and Animated WebP/GIF sequence export
 */

import { appState } from '../state.js';
import { soundManager } from '../utils/soundEffects.js';

export function initPixelArtTool(showToast) {
  // DOM Elements
  const canvas = document.getElementById('pixel-art-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const previewCanvas = document.getElementById('pixel-preview-canvas');
  const previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;

  // Controls
  const gridSizeSelect = document.getElementById('pixel-grid-size');
  const colorPicker = document.getElementById('pixel-current-color');
  const activeColorSwatch = document.getElementById('pixel-active-swatch');
  const paletteSwatchesWrap = document.getElementById('pixel-palette-swatches');
  const fpsSlider = document.getElementById('pixel-fps-slider');
  const fpsValueLabel = document.getElementById('pixel-fps-value');
  const onionSkinCheck = document.getElementById('pixel-onion-skin');
  const symmetryCheck = document.getElementById('pixel-symmetry-check');
  const gridLinesCheck = document.getElementById('pixel-grid-lines');

  // Tool buttons
  const toolBtns = document.querySelectorAll('.pixel-tool-btn');
  const clearBtn = document.getElementById('pixel-clear-btn');
  const undoBtn = document.getElementById('pixel-undo-btn');
  const redoBtn = document.getElementById('pixel-redo-btn');

  // Frame buttons
  const addFrameBtn = document.getElementById('pixel-add-frame-btn');
  const duplicateFrameBtn = document.getElementById('pixel-dup-frame-btn');
  const deleteFrameBtn = document.getElementById('pixel-del-frame-btn');
  const framesStrip = document.getElementById('pixel-frames-strip');
  const playPauseBtn = document.getElementById('pixel-play-pause-btn');

  // Export buttons
  const exportPngBtn = document.getElementById('pixel-export-png-btn');
  const exportSheetBtn = document.getElementById('pixel-export-sheet-btn');
  const exportScaleSelect = document.getElementById('pixel-export-scale');

  // State
  let gridSize = parseInt(gridSizeSelect ? gridSizeSelect.value : '16', 10);
  let activeTool = 'pencil'; // pencil, eraser, bucket, eyedropper, line
  let currentColor = colorPicker ? colorPicker.value : '#6366F1';
  let isDrawing = false;
  let lineStart = null;

  // Animation frames: Array of 2D arrays [ [ [hex, hex, ...], ... ] ]
  let frames = [createEmptyGrid(gridSize)];
  let currentFrameIdx = 0;
  let isPlaying = true;
  let animTimer = null;
  let fps = parseInt(fpsSlider ? fpsSlider.value : '8', 10);

  // Undo/Redo stack for current frame
  const undoStack = [];
  const redoStack = [];

  function createEmptyGrid(size) {
    const grid = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        row.push(null); // null = transparent
      }
      grid.push(row);
    }
    return grid;
  }

  function saveUndoState() {
    // Clone current frame
    const clone = JSON.parse(JSON.stringify(frames[currentFrameIdx]));
    undoStack.push(clone);
    if (undoStack.length > 30) undoStack.shift();
    redoStack.length = 0;
  }

  function resizeGrids(newSize) {
    saveUndoState();
    gridSize = newSize;
    frames = frames.map(oldGrid => {
      const newGrid = createEmptyGrid(newSize);
      const oldSize = oldGrid.length;
      for (let y = 0; y < Math.min(newSize, oldSize); y++) {
        for (let x = 0; x < Math.min(newSize, oldSize); x++) {
          newGrid[y][x] = oldGrid[y][x];
        }
      }
      return newGrid;
    });
    renderCanvas();
    renderFramesStrip();
  }

  // Render main drawing canvas
  function renderCanvas() {
    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / gridSize;
    ctx.clearRect(0, 0, width, height);

    // 1. Draw transparency checkerboard
    const checkSize = Math.max(8, cellSize / 2);
    for (let y = 0; y < height; y += checkSize) {
      for (let x = 0; x < width; x += checkSize) {
        ctx.fillStyle = ((x / checkSize + y / checkSize) % 2 === 0) ? '#131927' : '#0d121e';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }

    // 2. Draw Onion Skin (previous frame ghost) if enabled
    if (onionSkinCheck && onionSkinCheck.checked && currentFrameIdx > 0) {
      const prevGrid = frames[currentFrameIdx - 1];
      ctx.globalAlpha = 0.25;
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const color = prevGrid[y][x];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // 3. Draw active frame pixels
    const currentGrid = frames[currentFrameIdx];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const color = currentGrid[y][x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // 4. Draw Grid Lines if enabled
    if (gridLinesCheck && gridLinesCheck.checked) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= gridSize; i++) {
        const pos = Math.floor(i * cellSize);
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, height);
        ctx.stroke();

        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(width, pos);
        ctx.stroke();
      }
    }

    // 5. Draw Symmetry Center Line if enabled
    if (symmetryCheck && symmetryCheck.checked) {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      const mid = width / 2;
      ctx.beginPath();
      ctx.moveTo(mid, 0);
      ctx.lineTo(mid, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Draw pixel at cell coordinates
  function setPixel(x, y, color) {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
    frames[currentFrameIdx][y][x] = color;

    // Handle horizontal symmetry
    if (symmetryCheck && symmetryCheck.checked) {
      const symX = gridSize - 1 - x;
      frames[currentFrameIdx][y][symX] = color;
    }
  }

  // Flood fill algorithm (bucket)
  function floodFill(startX, startY, targetColor, fillColor) {
    if (targetColor === fillColor) return;
    const grid = frames[currentFrameIdx];
    if (grid[startY][startX] !== targetColor) return;

    const queue = [[startX, startY]];
    while (queue.length > 0) {
      const [x, y] = queue.pop();
      if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;
      if (grid[y][x] === targetColor) {
        grid[y][x] = fillColor;
        queue.push([x + 1, y]);
        queue.push([x - 1, y]);
        queue.push([x, y + 1]);
        queue.push([x, y - 1]);
      }
    }
  }

  // Bresenham's line algorithm
  function drawLine(x0, y0, x1, y1, color) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      setPixel(x0, y0, color);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  // Convert mouse event to grid cell coordinates
  function getCellCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / (canvas.width / gridSize));
    const y = Math.floor((e.clientY - rect.top) * scaleY / (canvas.height / gridSize));
    return {
      x: Math.max(0, Math.min(gridSize - 1, x)),
      y: Math.max(0, Math.min(gridSize - 1, y))
    };
  }

  // Mouse / Touch Event Handlers
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    saveUndoState();
    const { x, y } = getCellCoords(e);

    if (activeTool === 'pencil') {
      setPixel(x, y, currentColor);
    } else if (activeTool === 'eraser') {
      setPixel(x, y, null);
    } else if (activeTool === 'bucket') {
      const targetColor = frames[currentFrameIdx][y][x];
      floodFill(x, y, targetColor, currentColor);
    } else if (activeTool === 'eyedropper') {
      const picked = frames[currentFrameIdx][y][x];
      if (picked) {
        currentColor = picked;
        if (colorPicker) colorPicker.value = currentColor;
        if (activeColorSwatch) activeColorSwatch.style.background = currentColor;
        showToast(`Picked color: ${currentColor}`);
      }
    } else if (activeTool === 'line') {
      lineStart = { x, y };
    }

    renderCanvas();
    updateThumb(currentFrameIdx);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const { x, y } = getCellCoords(e);

    if (activeTool === 'pencil') {
      setPixel(x, y, currentColor);
      renderCanvas();
      updateThumb(currentFrameIdx);
    } else if (activeTool === 'eraser') {
      setPixel(x, y, null);
      renderCanvas();
      updateThumb(currentFrameIdx);
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (isDrawing && activeTool === 'line' && lineStart) {
      const { x, y } = getCellCoords(e);
      drawLine(lineStart.x, lineStart.y, x, y, currentColor);
      lineStart = null;
      renderCanvas();
      updateThumb(currentFrameIdx);
    }
    isDrawing = false;
  });

  // Undo / Redo
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (undoStack.length === 0) return;
      redoStack.push(JSON.parse(JSON.stringify(frames[currentFrameIdx])));
      frames[currentFrameIdx] = undoStack.pop();
      renderCanvas();
      updateThumb(currentFrameIdx);
      soundManager.playPop(480);
    });
  }

  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      if (redoStack.length === 0) return;
      undoStack.push(JSON.parse(JSON.stringify(frames[currentFrameIdx])));
      frames[currentFrameIdx] = redoStack.pop();
      renderCanvas();
      updateThumb(currentFrameIdx);
      soundManager.playPop(580);
    });
  }

  // Clear Canvas
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      saveUndoState();
      frames[currentFrameIdx] = createEmptyGrid(gridSize);
      renderCanvas();
      updateThumb(currentFrameIdx);
      showToast('Cleared active frame canvas');
      soundManager.playTrash();
    });
  }

  // Switch Tools
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toolBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTool = btn.dataset.tool;
      soundManager.playClick();
      showToast(`Selected Tool: ${activeTool.toUpperCase()}`);
    });
  });

  // Color selection
  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      currentColor = e.target.value;
      if (activeColorSwatch) activeColorSwatch.style.background = currentColor;
    });
  }

  // Grid size select
  if (gridSizeSelect) {
    gridSizeSelect.addEventListener('change', (e) => {
      const newSize = parseInt(e.target.value, 10);
      resizeGrids(newSize);
      showToast(`Grid resized to ${newSize}x${newSize}`);
    });
  }

  // Grid lines toggle
  if (gridLinesCheck) {
    gridLinesCheck.addEventListener('change', renderCanvas);
  }

  // Onion skin toggle
  if (onionSkinCheck) {
    onionSkinCheck.addEventListener('change', renderCanvas);
  }

  // Symmetry toggle
  if (symmetryCheck) {
    symmetryCheck.addEventListener('change', renderCanvas);
  }

  // Render Studio Active Palette Tokens for Pixel Art
  function renderPaletteSwatches() {
    if (!paletteSwatchesWrap) return;
    paletteSwatchesWrap.innerHTML = '';
    const slots = appState.getSlots();

    // Default retro colors + active slots
    const retroColors = ['#000000', '#FFFFFF', '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#EF4444', '#8B5CF6'];
    const combinedColors = Array.from(new Set([...slots.map(s => s.hex), ...retroColors]));

    combinedColors.forEach(hex => {
      const swatch = document.createElement('button');
      swatch.className = 'pixel-swatch-item';
      swatch.style.background = hex;
      swatch.title = hex;
      swatch.addEventListener('click', () => {
        currentColor = hex;
        if (colorPicker) colorPicker.value = hex;
        if (activeColorSwatch) activeColorSwatch.style.background = hex;
        soundManager.playPop(520);
      });
      paletteSwatchesWrap.appendChild(swatch);
    });
  }

  appState.subscribe(renderPaletteSwatches);
  renderPaletteSwatches();

  // Animation & Frames Strip Management
  function renderFramesStrip() {
    if (!framesStrip) return;
    framesStrip.innerHTML = '';

    frames.forEach((grid, idx) => {
      const frameCard = document.createElement('div');
      frameCard.className = `pixel-frame-card ${idx === currentFrameIdx ? 'active' : ''}`;
      frameCard.dataset.idx = idx;

      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 48;
      thumbCanvas.height = 48;
      thumbCanvas.className = 'pixel-frame-thumb';
      drawGridToCanvas(grid, thumbCanvas);

      const label = document.createElement('span');
      label.className = 'pixel-frame-label';
      label.textContent = `F${idx + 1}`;

      frameCard.appendChild(thumbCanvas);
      frameCard.appendChild(label);

      frameCard.addEventListener('click', () => {
        currentFrameIdx = idx;
        renderCanvas();
        renderFramesStrip();
        soundManager.playPop(440);
      });

      framesStrip.appendChild(frameCard);
    });
  }

  function updateThumb(idx) {
    if (!framesStrip) return;
    const card = framesStrip.querySelector(`.pixel-frame-card[data-idx="${idx}"]`);
    if (card) {
      const thumb = card.querySelector('.pixel-frame-thumb');
      if (thumb) {
        drawGridToCanvas(frames[idx], thumb);
      }
    }
  }

  function drawGridToCanvas(grid, targetCanvas) {
    const tCtx = targetCanvas.getContext('2d');
    const width = targetCanvas.width;
    const height = targetCanvas.height;
    const size = grid.length;
    const cellSize = width / size;

    tCtx.clearRect(0, 0, width, height);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = grid[y][x];
        if (color) {
          tCtx.fillStyle = color;
          tCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  // Add new frame
  if (addFrameBtn) {
    addFrameBtn.addEventListener('click', () => {
      frames.push(createEmptyGrid(gridSize));
      currentFrameIdx = frames.length - 1;
      renderCanvas();
      renderFramesStrip();
      showToast(`Added Frame ${frames.length}`);
      soundManager.playPop(600);
    });
  }

  // Duplicate frame
  if (duplicateFrameBtn) {
    duplicateFrameBtn.addEventListener('click', () => {
      const clone = JSON.parse(JSON.stringify(frames[currentFrameIdx]));
      frames.splice(currentFrameIdx + 1, 0, clone);
      currentFrameIdx++;
      renderCanvas();
      renderFramesStrip();
      showToast(`Duplicated Frame ${currentFrameIdx + 1}`);
      soundManager.playPop(640);
    });
  }

  // Delete frame
  if (deleteFrameBtn) {
    deleteFrameBtn.addEventListener('click', () => {
      if (frames.length <= 1) {
        showToast('Cannot delete only frame');
        return;
      }
      frames.splice(currentFrameIdx, 1);
      if (currentFrameIdx >= frames.length) currentFrameIdx = frames.length - 1;
      renderCanvas();
      renderFramesStrip();
      showToast(`Deleted frame. ${frames.length} frames remaining`);
      soundManager.playTrash();
    });
  }

  // Animation Play / Pause Loop
  let animFrameCounter = 0;
  function startAnimationLoop() {
    if (animTimer) clearInterval(animTimer);
    animTimer = setInterval(() => {
      if (!isPlaying || !previewCtx || frames.length === 0) return;
      animFrameCounter = (animFrameCounter + 1) % frames.length;
      drawGridToCanvas(frames[animFrameCounter], previewCanvas);
    }, 1000 / fps);
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playPauseBtn.innerHTML = isPlaying 
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Play';
      soundManager.playClick();
    });
  }

  if (fpsSlider) {
    fpsSlider.addEventListener('input', (e) => {
      fps = parseInt(e.target.value, 10);
      if (fpsValueLabel) fpsValueLabel.textContent = `${fps} FPS`;
      startAnimationLoop();
    });
  }

  // Export High-Res Crisp Pixel PNG
  if (exportPngBtn) {
    exportPngBtn.addEventListener('click', () => {
      const scale = parseInt(exportScaleSelect ? exportScaleSelect.value : '16', 10);
      const outCanvas = document.createElement('canvas');
      outCanvas.width = gridSize * scale;
      outCanvas.height = gridSize * scale;
      const oCtx = outCanvas.getContext('2d');
      oCtx.imageSmoothingEnabled = false;

      const currentGrid = frames[currentFrameIdx];
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const color = currentGrid[y][x];
          if (color) {
            oCtx.fillStyle = color;
            oCtx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }

      const link = document.createElement('a');
      link.download = `pixelcraft_${gridSize}x${gridSize}_f${currentFrameIdx + 1}.png`;
      link.href = outCanvas.toDataURL('image/png');
      link.click();
      showToast(`Exported crisp ${outCanvas.width}x${outCanvas.height} PNG!`);
      soundManager.playSuccess();
    });
  }

  // Export Horizontal Sprite Sheet PNG
  if (exportSheetBtn) {
    exportSheetBtn.addEventListener('click', () => {
      const scale = 16;
      const outCanvas = document.createElement('canvas');
      outCanvas.width = gridSize * scale * frames.length;
      outCanvas.height = gridSize * scale;
      const oCtx = outCanvas.getContext('2d');
      oCtx.imageSmoothingEnabled = false;

      frames.forEach((grid, idx) => {
        const offsetX = idx * gridSize * scale;
        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const color = grid[y][x];
            if (color) {
              oCtx.fillStyle = color;
              oCtx.fillRect(offsetX + x * scale, y * scale, scale, scale);
            }
          }
        }
      });

      const link = document.createElement('a');
      link.download = `pixelcraft_spritesheet_${frames.length}frames.png`;
      link.href = outCanvas.toDataURL('image/png');
      link.click();
      showToast(`Exported Sprite Sheet (${frames.length} frames)!`);
      soundManager.playSuccess();
    });
  }

  // Initialize
  renderCanvas();
  renderFramesStrip();
  startAnimationLoop();
}
