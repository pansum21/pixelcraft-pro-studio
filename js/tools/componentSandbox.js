/**
 * Live Component Sandbox & Design System Playground
 * Renders real interactive UI components (Buttons, Cards, Inputs, Modals)
 * dynamically synchronized in real-time with the Active Palette & Design Tokens.
 */

import { appState } from '../state.js';
import { soundManager } from '../utils/soundEffects.js';

export function initSandboxTool(showToast) {
  const previewFrame = document.getElementById('sandbox-preview-frame');
  const copyBtn = document.getElementById('sandbox-copy-code-btn');
  const themeToggle = document.getElementById('sandbox-preview-theme-toggle');

  if (!previewFrame) return;

  function updateSandbox(slots) {
    if (!slots || slots.length === 0) return;

    const c1 = slots[0]?.hex || '#6366F1';
    const c2 = slots[1]?.hex || '#EC4899';
    const c3 = slots[2]?.hex || '#F59E0B';
    const c4 = slots[3]?.hex || '#10B981';
    const c5 = slots[4]?.hex || '#3B82F6';

    // Apply CSS variables to preview frame
    if (previewFrame) {
      previewFrame.style.setProperty('--sb-primary', c1);
      previewFrame.style.setProperty('--sb-accent', c2);
      previewFrame.style.setProperty('--sb-warn', c3);
      previewFrame.style.setProperty('--sb-success', c4);
      previewFrame.style.setProperty('--sb-info', c5);
      previewFrame.style.setProperty('--sb-gradient', `linear-gradient(135deg, ${c1}, ${c2})`);
    }

    // Dynamic swatch badges in the sandbox header
    const swatchesWrap = document.getElementById('sandbox-active-swatches');
    if (swatchesWrap) {
      swatchesWrap.innerHTML = slots.map((s, idx) => `
        <span class="sandbox-swatch-chip" style="background-color: ${s.hex}" title="Slot ${idx + 1}: ${s.hex}">
          <span class="chip-label">${s.hex}</span>
        </span>
      `).join('');
    }
  }

  // Subscribe to live palette state changes
  appState.subscribe((slots) => {
    updateSandbox(slots);
  });

  // Initial render
  updateSandbox(appState.getSlots());

  // Dark / Light Preview Frame Canvas Toggle
  if (themeToggle && previewFrame) {
    themeToggle.addEventListener('click', () => {
      const isDark = previewFrame.getAttribute('data-frame-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      previewFrame.setAttribute('data-frame-theme', next);
      themeToggle.textContent = next === 'dark' ? 'Canvas: ☾ Dark Frame' : 'Canvas: ☀ Light Frame';
      soundManager.playSwitch(!isDark);
      if (showToast) showToast(`Sandbox canvas set to ${next} mode`);
    });
  }

  // Copy Complete Component Code (HTML & CSS)
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const slots = appState.getSlots();
      const c1 = slots[0]?.hex || '#6366F1';
      const c2 = slots[1]?.hex || '#EC4899';

      const snippet = `<!-- PixelCraft Generated Component System -->
<div class="px-card" style="background: rgba(13, 18, 30, 0.85); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 18px; padding: 1.5rem; backdrop-filter: blur(20px);">
  <span class="badge" style="background: ${c2}22; color: ${c2}; border: 1px solid ${c2}44; padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 700; font-size: 0.75rem;">FEATURED</span>
  <h3 style="color: #ffffff; font-size: 1.35rem; margin-top: 0.75rem;">Pro Architecture</h3>
  <p style="color: #94a3b8; font-size: 0.9rem; margin: 0.5rem 0 1.25rem;">Harmonious design tokens generated dynamically.</p>
  <button style="background: linear-gradient(135deg, ${c1}, ${c2}); color: #ffffff; border: none; padding: 0.65rem 1.3rem; border-radius: 10px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px ${c1}44;">
    Get Started
  </button>
</div>`;

      navigator.clipboard.writeText(snippet);
      soundManager.playCopy();
      if (showToast) showToast('Copied component markup to clipboard!');
    });
  }
}
