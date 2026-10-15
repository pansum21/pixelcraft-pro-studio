/**
 * Image Resizer, Cropper & Format Converter Tool
 * Client-side Canvas-based resizing, aspect ratio presets, quality compression, and conversion.
 */

export function initImageTool(showToast) {
  const fileInput = document.getElementById('image-file-input');
  const dropZone = document.getElementById('image-drop-zone');
  const previewContainer = document.getElementById('image-preview-wrapper');
  const previewCanvas = document.getElementById('image-preview-canvas');

  // Input Controls
  const widthInput = document.getElementById('image-width-input');
  const heightInput = document.getElementById('image-height-input');
  const lockAspectCheckbox = document.getElementById('image-lock-aspect');
  const formatSelect = document.getElementById('image-format-select');
  const qualitySlider = document.getElementById('image-quality-slider');
  const qualityValueLabel = document.getElementById('image-quality-val');
  const qualityGroup = document.getElementById('image-quality-group');

  // Meta & Stats
  const statOriginalDim = document.getElementById('image-stat-orig-dim');
  const statOriginalSize = document.getElementById('image-stat-orig-size');
  const statNewDim = document.getElementById('image-stat-new-dim');
  const statEstimatedSize = document.getElementById('image-stat-new-size');

  // Buttons
  const presetBtns = document.querySelectorAll('.aspect-preset-btn');
  const percentBtns = document.querySelectorAll('.percent-resize-btn');
  const downloadBtn = document.getElementById('image-download-btn');
  const resetBtn = document.getElementById('image-reset-btn');

  let currentImage = null;
  let originalFile = null;
  let originalWidth = 0;
  let originalHeight = 0;
  let targetWidth = 0;
  let targetHeight = 0;
  let aspectRatio = 1.0;

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }

    originalFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        originalWidth = img.naturalWidth || img.width;
        originalHeight = img.naturalHeight || img.height;
        aspectRatio = originalWidth / originalHeight;

        targetWidth = originalWidth;
        targetHeight = originalHeight;

        if (widthInput) widthInput.value = targetWidth;
        if (heightInput) heightInput.value = targetHeight;
        if (statOriginalDim) statOriginalDim.textContent = `${originalWidth} × ${originalHeight} px`;
        if (statOriginalSize) statOriginalSize.textContent = formatBytes(originalFile.size);

        if (previewContainer) previewContainer.classList.remove('hidden');
        if (dropZone) dropZone.classList.add('has-image');

        renderProcessedImage();
        showToast(`Loaded ${file.name}`);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderProcessedImage() {
    if (!currentImage || !previewCanvas) return;

    targetWidth = Math.max(1, parseInt(widthInput.value, 10) || originalWidth);
    targetHeight = Math.max(1, parseInt(heightInput.value, 10) || originalHeight);

    previewCanvas.width = targetWidth;
    previewCanvas.height = targetHeight;

    const ctx = previewCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(currentImage, 0, 0, targetWidth, targetHeight);

    if (statNewDim) statNewDim.textContent = `${targetWidth} × ${targetHeight} px`;

    updateEstimatedSize();
  }

  function updateEstimatedSize() {
    if (!previewCanvas) return;

    const format = formatSelect ? formatSelect.value : 'image/png';
    const quality = qualitySlider ? parseFloat(qualitySlider.value) : 0.9;

    // Toggle quality group visibility (PNG doesn't use lossy quality)
    if (qualityGroup) {
      qualityGroup.style.display = format === 'image/png' ? 'none' : 'block';
    }

    previewCanvas.toBlob((blob) => {
      if (blob && statEstimatedSize) {
        statEstimatedSize.textContent = formatBytes(blob.size);
      }
    }, format, quality);
  }

  // Width & Height inputs
  if (widthInput) {
    widthInput.addEventListener('input', () => {
      const w = parseInt(widthInput.value, 10);
      if (w > 0) {
        targetWidth = w;
        if (lockAspectCheckbox && lockAspectCheckbox.checked) {
          targetHeight = Math.round(targetWidth / aspectRatio);
          if (heightInput) heightInput.value = targetHeight;
        }
        renderProcessedImage();
      }
    });
  }

  if (heightInput) {
    heightInput.addEventListener('input', () => {
      const h = parseInt(heightInput.value, 10);
      if (h > 0) {
        targetHeight = h;
        if (lockAspectCheckbox && lockAspectCheckbox.checked) {
          targetWidth = Math.round(targetHeight * aspectRatio);
          if (widthInput) widthInput.value = targetWidth;
        }
        renderProcessedImage();
      }
    });
  }

  // Quality slider
  if (qualitySlider) {
    qualitySlider.addEventListener('input', (e) => {
      const val = Math.round(parseFloat(e.target.value) * 100);
      if (qualityValueLabel) qualityValueLabel.textContent = `${val}%`;
      updateEstimatedSize();
    });
  }

  // Format select
  if (formatSelect) {
    formatSelect.addEventListener('change', () => {
      updateEstimatedSize();
    });
  }

  // Percent scale buttons
  percentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentImage) return;
      const pct = parseFloat(btn.dataset.percent) / 100;
      targetWidth = Math.round(originalWidth * pct);
      targetHeight = Math.round(originalHeight * pct);
      if (widthInput) widthInput.value = targetWidth;
      if (heightInput) heightInput.value = targetHeight;
      renderProcessedImage();
      showToast(`Resized to ${btn.dataset.percent}%`);
    });
  });

  // Aspect ratio presets
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentImage) return;
      const ratioStr = btn.dataset.ratio;
      const [rW, rH] = ratioStr.split(':').map(Number);
      if (rW && rH) {
        aspectRatio = rW / rH;
        // Adjust height keeping current width
        targetHeight = Math.round(targetWidth / aspectRatio);
        if (heightInput) heightInput.value = targetHeight;
        renderProcessedImage();
        showToast(`Set aspect ratio to ${ratioStr}`);
      }
    });
  });

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!currentImage) return;
      targetWidth = originalWidth;
      targetHeight = originalHeight;
      aspectRatio = originalWidth / originalHeight;
      if (widthInput) widthInput.value = targetWidth;
      if (heightInput) heightInput.value = targetHeight;
      if (qualitySlider) {
        qualitySlider.value = '0.9';
        if (qualityValueLabel) qualityValueLabel.textContent = '90%';
      }
      if (formatSelect) formatSelect.value = 'image/png';
      renderProcessedImage();
      showToast('Reset to original size');
    });
  }

  // Download button
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!previewCanvas || !currentImage) {
        showToast('Please upload an image first');
        return;
      }

      const format = formatSelect ? formatSelect.value : 'image/png';
      const quality = qualitySlider ? parseFloat(qualitySlider.value) : 0.9;
      const ext = format === 'image/jpeg' ? 'jpg' : (format === 'image/webp' ? 'webp' : 'png');

      const originalName = originalFile ? originalFile.name.replace(/\.[^/.]+$/, '') : 'image';
      const fileName = `${originalName}-${targetWidth}x${targetHeight}.${ext}`;

      previewCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        showToast(`Downloaded ${fileName}`);
      }, format, quality);
    });
  }

  // Drag and drop & file inputs
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

  // Default placeholder sample image if no image uploaded
  loadDefaultSample();

  function loadDefaultSample() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Create stylish modern gradient canvas
    const grad = ctx.createLinearGradient(0, 0, 800, 500);
    grad.addColorStop(0, '#4F46E5');
    grad.addColorStop(0.5, '#7C3AED');
    grad.addColorStop(1, '#EC4899');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 500);

    // Grid accent
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 500);
      ctx.stroke();
    }
    for (let y = 0; y < 500; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Circle glow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(400, 250, 140, 0, Math.PI * 2);
    ctx.fill();

    // Typography
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PixelCraft Sample Image', 400, 240);
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText('800 × 500 px • Ready to Resize, Scale & Convert', 400, 280);

    canvas.toBlob((blob) => {
      const sampleFile = new File([blob], 'pixelcraft-sample.png', { type: 'image/png' });
      handleFile(sampleFile);
    }, 'image/png');
  }
}
