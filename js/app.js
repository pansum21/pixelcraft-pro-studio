/**
 * Main Application Controller for PixelCraft Studio
 * Handles interactive mouse spotlight, sliding dock pill, Command Menu HUD (Ctrl+K),
 * dark/light themes, and tools initialization.
 */

import { initPaletteTool } from './tools/palette.js';
import { initContrastTool } from './tools/contrast.js';
import { initSvgTool } from './tools/svgViewer.js';
import { initImageTool } from './tools/imageResizer.js';
import { initGradientTool } from './tools/gradient.js';
import { initExtractorTool } from './tools/extractor.js';
import { initWaveTool } from './tools/waveGenerator.js';
import { initShadowTool } from './tools/shadowGenerator.js';
import { initCodeCardTool } from './tools/codeCard.js';
import { initFaviconTool } from './tools/faviconGenerator.js';
import { initSandboxTool } from './tools/componentSandbox.js';
import { initTokenExporterTool } from './tools/tokenExporter.js';
import { soundManager } from './utils/soundEffects.js';
import { LibraryManager } from './utils/libraryManager.js';
import { authManager } from './utils/authManager.js';

// Toast Notification Manager
let toastTimer = null;
export function showToast(message, duration = 2400) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="toast-icon">✨</span><span>${message}</span>`;
  toast.classList.add('visible');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, duration);
}

// Mouse Spotlight Tracking Effect (Linear/Vercel style)
function initSpotlight() {
  window.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    document.documentElement.style.setProperty('--mouse-x', `${x}px`);
    document.documentElement.style.setProperty('--mouse-y', `${y}px`);

    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
      cursorGlow.style.transform = `translate(${x - 250}px, ${y - 250}px)`;
    }
  }, { passive: true });
}

import { appState } from './state.js';
import { setContrastColors } from './tools/contrast.js';

// Theme Manager (Chunky Slider: Left = Light, Right = Dark)
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle-btn');
  const labelLight = document.getElementById('label-light');
  const labelDark = document.getElementById('label-dark');
  const storedTheme = localStorage.getItem('pixelcraft-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pixelcraft-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
    }
  }

  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = active === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      soundManager.playSwitch(next === 'dark');
      showToast(`Switched to ${next === 'dark' ? 'Dark Mode ☾' : 'Light Mode ☀'}`);
    });
  }

  if (labelLight) {
    labelLight.addEventListener('click', () => {
      applyTheme('light');
      soundManager.playSwitch(false);
      showToast('Switched to Light Mode ☀');
    });
  }

  if (labelDark) {
    labelDark.addEventListener('click', () => {
      applyTheme('dark');
      soundManager.playSwitch(true);
      showToast('Switched to Dark Mode ☾');
    });
  }
}

// Tactile Sound FX Toggle
function initSoundToggle() {
  const btn = document.getElementById('sound-toggle-btn');
  if (!btn) return;
  const updateVisual = () => {
    const on = soundManager.isEnabled();
    btn.innerHTML = on ? '<span class="sound-icon">🔊</span>' : '<span class="sound-icon">🔇</span>';
    btn.classList.toggle('muted', !on);
    btn.title = on ? 'Sound FX: ON (Click to Mute)' : 'Sound FX: MUTED (Click to Enable)';
  };
  updateVisual();
  btn.addEventListener('click', () => {
    const enabled = soundManager.toggle();
    updateVisual();
    showToast(enabled ? 'Tactile Audio Enabled 🔊' : 'Audio Muted 🔇');
  });
}

// Collapsible Sidebar (Zen Mode)
function initSidebarCollapse() {
  const btn = document.getElementById('sidebar-collapse-btn');
  const sidebar = document.querySelector('.app-sidebar');
  if (!btn || !sidebar) return;

  const stored = localStorage.getItem('pixelcraft-sidebar-collapsed') === 'true';
  if (stored) {
    sidebar.classList.add('collapsed');
  }

  btn.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    localStorage.setItem('pixelcraft-sidebar-collapsed', isCollapsed ? 'true' : 'false');
    soundManager.playClick();
    showToast(isCollapsed ? 'Sidebar Collapsed (Zen Mode)' : 'Sidebar Expanded');
  });
}

// Presets & Favorites Vault Hub Modal
function initVaultHub(switchToolFn) {
  const modal = document.getElementById('library-vault-modal');
  const openBtns = [
    document.getElementById('sidebar-vault-btn'),
    document.getElementById('header-vault-btn')
  ];
  const closeBtn = document.getElementById('vault-modal-close-btn');
  const saveCurrentBtn = document.getElementById('vault-save-current-btn');
  const list = document.getElementById('vault-items-list');

  if (!modal || !list) return;

  function renderVault() {
    const items = LibraryManager.getItems();
    list.innerHTML = '';
    if (items.length === 0) {
      list.innerHTML = '<div style="color:var(--text-dim);padding:2rem;text-align:center;grid-column:1/-1;">No saved presets yet. Click "+ Save Current Palette" to store your favorite color systems!</div>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'vault-item-card';

      const swatchesHtml = item.data.hexes 
        ? item.data.hexes.map(h => `<div class="vault-swatch-slot" style="background-color:${h}" title="${h}"></div>`).join('') 
        : '';

      const isSynced = item.cloudSynced || authManager.isLoggedIn();
      const syncPill = isSynced 
        ? `<span class="vault-sync-pill" title="Synced with Google Account">☁️ Cloud Synced</span>`
        : '';

      card.innerHTML = `
        <div class="vault-item-header">
          <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
            <span class="vault-item-title">${item.name}</span>
            ${syncPill}
          </div>
          <span class="vault-item-date">${item.createdAt}</span>
        </div>
        <div class="vault-swatches-strip">
          ${swatchesHtml}
        </div>
        <div class="vault-item-actions">
          <button class="btn btn-neon vault-restore-btn" style="padding:0.35rem 0.75rem;font-size:0.8rem;">Restore</button>
          <button class="glass-icon-btn vault-del-btn" style="width:28px;height:28px;" title="Delete">&times;</button>
        </div>
      `;

      card.querySelector('.vault-restore-btn').addEventListener('click', () => {
        LibraryManager.restoreItem(item.id, switchToolFn, showToast);
        modal.close();
      });

      card.querySelector('.vault-del-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        LibraryManager.deleteItem(item.id);
        renderVault();
        showToast('Preset deleted from vault');
      });

      list.appendChild(card);
    });
  }

  openBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', () => {
      renderVault();
      modal.showModal();
      soundManager.playPop(520);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.close();
      soundManager.playClick();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  if (saveCurrentBtn) {
    saveCurrentBtn.addEventListener('click', () => {
      const name = prompt('Enter a name for this preset:', `Palette #${Math.floor(Math.random() * 899 + 100)}`);
      if (name !== null) {
        LibraryManager.saveCurrentPalette(name.trim() || undefined);
        renderVault();
        showToast('Saved current palette to Vault ⭐');
      }
    });
  }

  // Also bridge tokens button to tokens modal
  const tokensBtns = [
    document.getElementById('sidebar-tokens-btn'),
    document.getElementById('header-tokens-btn')
  ];
  const tokensModal = document.getElementById('tokens-hub-modal');
  tokensBtns.forEach(btn => {
    if (btn && tokensModal) {
      btn.addEventListener('click', () => {
        tokensModal.showModal();
        soundManager.playPop(540);
      });
    }
  });
}

// Google Authentication & User Profile Hub
function initAuthUI(switchToolFn) {
  // Elements
  const loginBtn = document.getElementById('google-login-btn');
  const sidebarLoginBtn = document.getElementById('sidebar-google-login-btn');
  const sidebarUserCard = document.getElementById('sidebar-user-card');
  const sidebarSignoutBtn = document.getElementById('sidebar-signout-btn');
  const profileWidget = document.getElementById('user-profile-widget');
  const userProfileBtn = document.getElementById('user-profile-btn');
  const userProfileDropdown = document.getElementById('user-profile-dropdown');
  const authModal = document.getElementById('auth-modal');
  const authModalCloseBtn = document.getElementById('auth-modal-close-btn');
  const fastGoogleBtn = document.getElementById('auth-fast-google-btn');
  const signoutBtn = document.getElementById('auth-signout-btn');
  const clientIdInput = document.getElementById('auth-client-id-input');
  const saveClientIdBtn = document.getElementById('auth-save-client-id-btn');
  const profileOpenVaultBtn = document.getElementById('profile-open-vault-btn');
  const profileOpenTokensBtn = document.getElementById('profile-open-tokens-btn');

  // Populate client ID if stored
  if (clientIdInput) {
    clientIdInput.value = authManager.getClientId() || '';
  }

  // Open Auth Modal from Header or Sidebar
  const openModalHandler = () => {
    if (authModal) {
      authModal.showModal();
      soundManager.playPop(520);
      authManager.initGoogleGis();
    }
  };

  if (loginBtn) loginBtn.addEventListener('click', openModalHandler);
  if (sidebarLoginBtn) sidebarLoginBtn.addEventListener('click', openModalHandler);

  // Close Auth Modal
  if (authModalCloseBtn && authModal) {
    authModalCloseBtn.addEventListener('click', () => {
      authModal.close();
      soundManager.playClick();
    });
  }

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        authModal.close();
      }
    });
  }

  // Fast 1-Click Google Sign In (Immediate profile + cloud sync session)
  if (fastGoogleBtn) {
    fastGoogleBtn.addEventListener('click', () => {
      const user = authManager.fastGoogleLogin();
      if (authModal) authModal.close();
      showToast(`Welcome ${user.name}! Cloud Sync active ☁️`);
    });
  }

  // Profile Dropdown Toggle
  if (userProfileBtn && userProfileDropdown) {
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = userProfileDropdown.classList.contains('hidden');
      if (isHidden) {
        userProfileDropdown.classList.remove('hidden');
        userProfileBtn.setAttribute('aria-expanded', 'true');
        soundManager.playPop(540);
      } else {
        userProfileDropdown.classList.add('hidden');
        userProfileBtn.setAttribute('aria-expanded', 'false');
        soundManager.playClick();
      }
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!userProfileDropdown.classList.contains('hidden') && !userProfileDropdown.contains(e.target)) {
        userProfileDropdown.classList.add('hidden');
        userProfileBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Sign out handlers (Header dropdown + Sidebar)
  const signOutHandler = () => {
    authManager.signOut();
    if (userProfileDropdown) userProfileDropdown.classList.add('hidden');
    showToast('Signed out of Google session');
  };

  if (signoutBtn) signoutBtn.addEventListener('click', signOutHandler);
  if (sidebarSignoutBtn) sidebarSignoutBtn.addEventListener('click', signOutHandler);

  // Profile Dropdown Quick Links
  if (profileOpenVaultBtn) {
    profileOpenVaultBtn.addEventListener('click', () => {
      if (userProfileDropdown) userProfileDropdown.classList.add('hidden');
      document.getElementById('header-vault-btn')?.click();
    });
  }

  if (profileOpenTokensBtn) {
    profileOpenTokensBtn.addEventListener('click', () => {
      if (userProfileDropdown) userProfileDropdown.classList.add('hidden');
      document.getElementById('tokens-hub-modal')?.showModal();
    });
  }

  // Save Google OAuth Client ID
  if (saveClientIdBtn && clientIdInput) {
    saveClientIdBtn.addEventListener('click', () => {
      const val = clientIdInput.value.trim();
      authManager.setClientId(val);
      showToast(val ? 'Google Client ID saved & initialized! ✨' : 'Client ID cleared');
    });
  }

  // Subscribe to auth state updates across the studio
  authManager.subscribe((user) => {
    if (user) {
      // Header
      if (loginBtn) loginBtn.style.display = 'none';
      if (profileWidget) profileWidget.style.display = 'inline-flex';

      const avatar = document.getElementById('user-avatar-img');
      const name = document.getElementById('user-display-name');
      const dropAvatar = document.getElementById('dropdown-avatar-img');
      const dropName = document.getElementById('dropdown-user-name');
      const dropEmail = document.getElementById('dropdown-user-email');

      if (avatar) avatar.src = user.picture || '';
      if (name) name.textContent = user.name || 'Designer Pro';
      if (dropAvatar) dropAvatar.src = user.picture || '';
      if (dropName) dropName.textContent = user.name || 'Designer Pro';
      if (dropEmail) dropEmail.textContent = user.email || 'designer.pro@gmail.com';

      // Sidebar
      if (sidebarLoginBtn) sidebarLoginBtn.style.display = 'none';
      if (sidebarUserCard) sidebarUserCard.style.display = 'flex';
      const sideAvatar = document.getElementById('sidebar-user-avatar-img');
      const sideName = document.getElementById('sidebar-user-name');
      if (sideAvatar) sideAvatar.src = user.picture || '';
      if (sideName) sideName.textContent = user.name || 'Designer Pro';
    } else {
      // Header
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (profileWidget) profileWidget.style.display = 'none';
      if (userProfileDropdown) userProfileDropdown.classList.add('hidden');

      // Sidebar
      if (sidebarLoginBtn) sidebarLoginBtn.style.display = 'flex';
      if (sidebarUserCard) sidebarUserCard.style.display = 'none';
    }
  });

  // Try initial GIS render if client ID was stored
  authManager.initGoogleGis();
}

// PWA Offline Engine & Desktop Install Prompt
function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=5.3').then((reg) => {
      console.log('[PixelCraft PWA] Service Worker registered successfully:', reg.scope);
      reg.update().catch(() => {});
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PixelCraft PWA] New version installed, reloading UI...');
              window.location.reload();
            }
          });
        }
      });
    }).catch((err) => {
      console.warn('[PixelCraft PWA] SW registration ignored:', err);
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  let deferredPrompt;
  const installBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.style.display = 'flex';
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log('[PixelCraft PWA] User install choice:', outcome);
          deferredPrompt = null;
          installBtn.style.display = 'none';
        }
      });
    }
  });
}

// Global Palette Floating Dock
function initGlobalPaletteDock(switchToolFn) {
  const dock = document.getElementById('global-palette-dock');
  const swatchesWrap = document.getElementById('dock-swatches-wrap');
  if (!dock || !swatchesWrap) return;

  function renderDock(slots) {
    swatchesWrap.innerHTML = '';
    slots.forEach((slot, idx) => {
      const pill = document.createElement('div');
      pill.className = 'dock-color-pill';
      pill.style.backgroundColor = slot.hex;
      pill.title = `Slot ${idx + 1}: ${slot.hex} — Click to copy, Shift+Click to test in Contrast`;
      
      pill.addEventListener('click', (e) => {
        if (e.shiftKey) {
          setContrastColors(slot.hex, '#FFFFFF', idx);
          switchToolFn('contrast');
          showToast(`Loaded Slot ${idx + 1} (${slot.hex}) into Contrast Checker`);
        } else {
          navigator.clipboard.writeText(slot.hex);
          showToast(`Copied ${slot.hex} to clipboard!`);
        }
      });
      swatchesWrap.appendChild(pill);
    });
  }

  appState.subscribe((slots) => {
    renderDock(slots);
  });

  renderDock(appState.getSlots());
}

// Command HUD Menu (Ctrl+K / Cmd+K)
function initCommandMenu(switchToolFn) {
  const modal = document.getElementById('command-menu-modal');
  const input = document.getElementById('command-menu-input');
  const list = document.getElementById('command-menu-list');
  const openBtn = document.getElementById('command-menu-trigger-btn');

  if (!modal || !input || !list) return;

  const commands = [
    { 
      id: 'tool-palette', 
      icon: '🎨', 
      category: 'Studio', 
      label: 'Color Palette Studio', 
      desc: 'Interactive 3-7 slot harmonies, lock pins, and 10-shade tonal scale ramps', 
      action: () => switchToolFn('palette') 
    },
    { 
      id: 'tool-contrast', 
      icon: '⚡', 
      category: 'Studio', 
      label: 'WCAG Contrast Inspector', 
      desc: 'Validate AA/AAA contrast ratios, circular gauge, and intelligent auto-fixer', 
      action: () => switchToolFn('contrast') 
    },
    { 
      id: 'tool-extractor', 
      icon: '📸', 
      category: 'Studio', 
      label: 'Image Palette Extractor', 
      desc: 'Drop photos to sample and quantize dominant aesthetic color palettes', 
      action: () => switchToolFn('extractor') 
    },
    { 
      id: 'tool-svg', 
      icon: '📐', 
      category: 'Studio', 
      label: 'SVG Vector Forge', 
      desc: 'Minify SVG metadata, pan & zoom viewer, high-res PNG export, and palette recoloring', 
      action: () => switchToolFn('svg') 
    },
    { 
      id: 'tool-wave', 
      icon: '🌊', 
      category: 'Studio', 
      label: 'SVG Wave & Divider Studio', 
      desc: 'Compose smooth bezier waves, organic section dividers, and layered depth curves', 
      action: () => switchToolFn('wave') 
    },
    { 
      id: 'tool-shadow', 
      icon: '🔲', 
      category: 'Studio', 
      label: 'Smooth Layered Shadow Lab', 
      desc: 'Craft natural multi-step light dispersion shadows and colored ambient blooms', 
      action: () => switchToolFn('shadow') 
    },
    { 
      id: 'tool-gradient', 
      icon: '🔮', 
      category: 'Studio', 
      label: 'CSS Gradient & Glass Shader', 
      desc: 'Multi-stop linear/radial/conic gradients and realistic frosted glass refraction', 
      action: () => switchToolFn('gradient') 
    },
    { 
      id: 'tool-codecard', 
      icon: '💻', 
      category: 'Studio', 
      label: 'Code & Quote Beautifier', 
      desc: 'Turn code snippets or quotes into gorgeous macOS-style screenshot cards', 
      action: () => switchToolFn('codecard') 
    },
    { 
      id: 'tool-image', 
      icon: '🖼️', 
      category: 'Studio', 
      label: 'Image Resizer & Transcoder', 
      desc: 'Client-side image scaling, aspect ratio presets, and WebP/PNG/JPEG compression', 
      action: () => switchToolFn('image') 
    },
    { 
      id: 'tool-favicon', 
      icon: '🏷️', 
      category: 'Studio', 
      label: 'Favicon & App Icon Studio', 
      desc: 'Generate pixel-perfect multi-resolution icons with live browser tab mockup', 
      action: () => switchToolFn('favicon') 
    },
    { 
      id: 'tool-sandbox', 
      icon: '🧪', 
      category: 'Studio', 
      label: 'Live Component Sandbox', 
      desc: 'Real-time design system playground testing components dynamically with active palette', 
      action: () => switchToolFn('sandbox') 
    },
    { 
      id: 'action-vault', 
      icon: '⭐', 
      category: 'Vault', 
      label: 'Open Studio Presets & Vault', 
      desc: 'Browse saved color harmonies, restore favorites, or save current palette', 
      action: () => document.getElementById('header-vault-btn')?.click() 
    },
    { 
      id: 'action-tokens', 
      icon: '📦', 
      category: 'Export', 
      label: 'Export Design Tokens (Tailwind / Figma / Flutter / RN)', 
      desc: 'Multi-platform code generator exporting colors, radius, and shadows to any framework', 
      action: () => document.getElementById('tokens-hub-modal')?.showModal() 
    },
    { 
      id: 'action-sound', 
      icon: '🔊', 
      category: 'Audio', 
      label: 'Toggle Tactile Audio Sounds', 
      desc: 'Enable or mute realistic synthesized Web Audio UI sound effects', 
      action: () => document.getElementById('sound-toggle-btn')?.click() 
    },
    { 
      id: 'action-zen', 
      icon: '🔲', 
      category: 'View', 
      label: 'Toggle Sidebar Zen Mode', 
      desc: 'Collapse or expand left sidebar menu for distraction-free workspace canvas', 
      action: () => document.getElementById('sidebar-collapse-btn')?.click() 
    },
    { 
      id: 'action-matrix', 
      icon: '📊', 
      category: 'Workflow', 
      label: 'Palette Contrast Matrix', 
      desc: 'View comprehensive N×N accessibility table comparing every palette color pair', 
      action: () => { 
        switchToolFn('palette'); 
        document.getElementById('palette-matrix-btn')?.click(); 
      } 
    },
    { 
      id: 'action-ui-sim', 
      icon: '📱', 
      category: 'Workflow', 
      label: 'UI Design System Simulator', 
      desc: 'Test your palette on live buttons, cards, links, and badges in dark/light mode', 
      action: () => { 
        switchToolFn('palette'); 
        const drawer = document.getElementById('palette-ui-preview-drawer');
        if (drawer?.classList.contains('hidden')) {
          document.getElementById('palette-ui-preview-toggle')?.click();
        }
      } 
    },
    { 
      id: 'action-recolor-svg', 
      icon: '🎨', 
      category: 'Workflow', 
      label: 'Recolor SVG with Active Palette', 
      desc: 'Switch to SVG Forge and apply current active palette colors to vector shapes', 
      action: () => { 
        switchToolFn('svg'); 
        document.getElementById('svg-recolor-palette-btn')?.click(); 
      } 
    },
    { 
      id: 'action-load-gradient', 
      icon: '🌈', 
      category: 'Workflow', 
      label: 'Load Palette into Gradient Stops', 
      desc: 'Import active palette colors directly as multi-stop gradient color stops', 
      action: () => { 
        switchToolFn('gradient'); 
        document.getElementById('gradient-import-palette-btn')?.click(); 
      } 
    },
    { 
      id: 'action-export-palette', 
      icon: '📦', 
      category: 'Export', 
      label: 'Export Palette (CSS / Tailwind / JSON)', 
      desc: 'Download palette swatches, copy CSS variables, or copy Tailwind config', 
      action: () => { 
        switchToolFn('palette'); 
        document.getElementById('palette-export-btn')?.click(); 
      } 
    },
    { 
      id: 'action-generate', 
      icon: '🎲', 
      category: 'Action', 
      label: 'Generate Random Palette', 
      desc: 'Instantly generate new harmonious palette colors (Shortcut: Space)', 
      action: () => { 
        switchToolFn('palette'); 
        document.getElementById('palette-generate-btn')?.click(); 
      } 
    },
    { 
      id: 'action-theme', 
      icon: '🌓', 
      category: 'Theme', 
      label: 'Toggle Dark / Light Mode', 
      desc: 'Switch interface contrast theme between Obsidian Night and Crisp Light', 
      action: () => document.getElementById('theme-toggle-btn')?.click() 
    },
    {
      id: 'action-auth-google',
      icon: '🔐',
      category: 'Account',
      label: 'Sign In with Google (Cloud Sync)',
      desc: 'Sync presets, design tokens, and preferences with your Google account',
      action: () => {
        if (authManager.isLoggedIn()) {
          document.getElementById('user-profile-btn')?.click();
        } else {
          document.getElementById('google-login-btn')?.click();
        }
      }
    }
  ];

  function renderList(query = '') {
    list.innerHTML = '';
    const cleanQuery = query.toLowerCase().trim();
    const filtered = commands.filter(c => 
      c.label.toLowerCase().includes(cleanQuery) || 
      c.desc.toLowerCase().includes(cleanQuery) ||
      c.category.toLowerCase().includes(cleanQuery)
    );

    if (filtered.length === 0) {
      list.innerHTML = '<div class="command-empty">No matching commands found. Try searching for "palette", "contrast", or "gradient".</div>';
      return;
    }

    filtered.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `command-item ${idx === 0 ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="command-item-left">
          <span class="command-item-icon">${cmd.icon}</span>
          <div class="command-item-main">
            <div class="command-title-row">
              <span class="command-item-title">${cmd.label}</span>
              <span class="command-category-tag tag-${cmd.category.toLowerCase()}">${cmd.category}</span>
            </div>
            <span class="command-item-desc">${cmd.desc}</span>
          </div>
        </div>
        <kbd class="command-shortcut">↵ Enter</kbd>
      `;
      item.addEventListener('click', () => {
        cmd.action();
        modal.close();
      });
      list.appendChild(item);
    });
  }

  function openModal() {
    input.value = '';
    renderList('');
    modal.showModal();
    setTimeout(() => input.focus(), 50);
  }

  if (openBtn) openBtn.addEventListener('click', openModal);

  // Global key combo: Cmd+K or Ctrl+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.open) {
        modal.close();
      } else {
        openModal();
      }
    }
  });

  input.addEventListener('input', (e) => {
    renderList(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('.command-item');
    let selectedIdx = Array.from(items).findIndex(el => el.classList.contains('selected'));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        items[selectedIdx]?.classList.remove('selected');
        selectedIdx = (selectedIdx + 1) % items.length;
        items[selectedIdx]?.classList.add('selected');
        items[selectedIdx]?.scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        items[selectedIdx]?.classList.remove('selected');
        selectedIdx = (selectedIdx - 1 + items.length) % items.length;
        items[selectedIdx]?.classList.add('selected');
        items[selectedIdx]?.scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[selectedIdx]?.click();
    } else if (e.key === 'Escape') {
      modal.close();
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

// Navigation & Tab Switching
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-tab-btn');
  const toolViews = document.querySelectorAll('.tool-view');

  function switchTool(toolId) {
    let validTool = false;

    toolViews.forEach(view => {
      if (view.id === `tool-${toolId}`) {
        view.classList.remove('hidden');
        view.classList.add('active');
        validTool = true;
      } else {
        view.classList.add('hidden');
        view.classList.remove('active');
      }
    });

    if (!validTool && toolViews.length > 0) {
      toolId = 'palette';
      document.getElementById('tool-palette')?.classList.remove('hidden');
      document.getElementById('tool-palette')?.classList.add('active');
    }

    navButtons.forEach(btn => {
      if (btn.dataset.tool === toolId) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    const toolNames = {
      palette: '01 / Color Palette Studio',
      contrast: '02 / WCAG Contrast Inspector',
      extractor: '03 / Image Palette Extractor',
      svg: '04 / SVG Vector Forge',
      wave: '05 / SVG Wave & Section Dividers',
      shadow: '06 / Layered Shadows & Ambient Glow',
      gradient: '07 / Gradients & Glassmorphism',
      codecard: '08 / Code & Text Beautifier',
      image: '09 / High-Res Image Resizer',
      favicon: '10 / Favicon & App Icon Studio',
      sandbox: '11 / Live Component Sandbox'
    };

    const activeIndicator = document.getElementById('active-tool-indicator');
    if (activeIndicator && toolNames[toolId]) {
      activeIndicator.textContent = toolNames[toolId];
    }

    if (window.location.hash !== `#${toolId}`) {
      history.replaceState(null, '', `#${toolId}`);
    }

    soundManager.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Bulletproof event delegation for navigation
  const toolNav = document.querySelector('.tool-nav');
  if (toolNav) {
    toolNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-tab-btn');
      if (btn && btn.dataset.tool) {
        e.preventDefault();
        switchTool(btn.dataset.tool);
      }
    });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTool(btn.dataset.tool);
    });
  });

  function handleHash() {
    const hash = window.location.hash.replace('#', '') || 'palette';
    switchTool(hash);
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();

  // Keyboard navigation for tabs (1 to 0, S for sandbox)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const toolKeys = {
      '1': 'palette',
      '2': 'contrast',
      '3': 'extractor',
      '4': 'svg',
      '5': 'wave',
      '6': 'shadow',
      '7': 'gradient',
      '8': 'codecard',
      '9': 'image',
      '0': 'favicon',
      's': 'sandbox',
      'S': 'sandbox'
    };

    if (toolKeys[e.key]) {
      switchTool(toolKeys[e.key]);
      showToast(`Switched tool (${toolKeys[e.key]})`);
    }
  });

  return switchTool;
}

function startApp() {
  initSpotlight();
  initTheme();
  initSoundToggle();
  initSidebarCollapse();
  const switchTool = initNavigation();
  initCommandMenu(switchTool);
  initGlobalPaletteDock(switchTool);
  initVaultHub(switchTool);
  initAuthUI(switchTool);
  initPWA();

  const initSafely = (name, fn) => {
    try {
      fn(showToast);
      console.log(`[PixelCraft] ${name} ready.`);
    } catch (err) {
      console.error(`[PixelCraft] Error initializing ${name}:`, err);
    }
  };

  initSafely('Palette Studio', initPaletteTool);
  initSafely('Contrast Inspector', initContrastTool);
  initSafely('Palette Extractor', initExtractorTool);
  initSafely('SVG Forge', initSvgTool);
  initSafely('Wave Studio', initWaveTool);
  initSafely('Shadow Studio', initShadowTool);
  initSafely('Gradient Shader', initGradientTool);
  initSafely('Code Card Beautifier', initCodeCardTool);
  initSafely('Image Resizer', initImageTool);
  initSafely('Favicon Studio', initFaviconTool);
  initSafely('Component Sandbox', initSandboxTool);
  initSafely('Design Tokens Hub', initTokenExporterTool);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
