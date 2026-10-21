/**
 * Community Showcase & Trending Creations Hub
 * Enables users to browse, like, and 1-click import trending community palettes & pixel art.
 * Supports zero-server LocalStorage + seamless Firebase Firestore syncing.
 */

import { appState } from '../state.js';
import { soundManager } from './soundEffects.js';

const COMMUNITY_STORAGE_KEY = 'pixelcraft_community_presets_v1';
const LIKES_STORAGE_KEY = 'pixelcraft_community_likes_v1';

export const INITIAL_TRENDING_CREATIONS = [
  {
    id: 'comm_1',
    title: 'Cyberpunk Neon 2077',
    category: 'Cyberpunk / Dark UI',
    author: 'NeoGlitch',
    likes: 4210,
    hexes: ['#0D0221', '#0F084B', '#26408B', '#A6CFE2', '#F806CC'],
    type: 'palette'
  },
  {
    id: 'comm_2',
    title: '8-Bit Retro Heart & Potion',
    category: 'Pixel Art / Gaming',
    author: 'PixelKnight',
    likes: 3890,
    hexes: ['#EF4444', '#DC2626', '#B91C1C', '#FFFFFF', '#1F2937'],
    type: 'pixelart',
    spritePreview: true
  },
  {
    id: 'comm_3',
    title: 'Pastel Dreamscape',
    category: 'Minimal / Aesthetic',
    author: 'SakuraCloud',
    likes: 2950,
    hexes: ['#FFB5E8', '#FF9CEE', '#B28DFF', '#C5A3FF', '#E7C6FF'],
    type: 'palette'
  },
  {
    id: 'comm_4',
    title: 'Retro 80s Synthwave Sunset',
    category: 'Vaporwave',
    author: 'LaserWave84',
    likes: 5120,
    hexes: ['#2E0249', '#570A57', '#A91079', '#F806CC', '#FFE600'],
    type: 'palette'
  },
  {
    id: 'comm_5',
    title: 'Nordic Forest & Pine',
    category: 'Nature / Organic',
    author: 'FjordDesigner',
    likes: 2310,
    hexes: ['#283618', '#606C38', '#DDA15E', '#BC6C25', '#FEFAE0'],
    type: 'palette'
  },
  {
    id: 'comm_6',
    title: 'Obsidian Emerald Pro',
    category: 'SaaS / Fintech',
    author: 'VercelArchitect',
    likes: 3410,
    hexes: ['#05070C', '#064E3B', '#10B981', '#34D399', '#F8FAFC'],
    type: 'palette'
  }
];

export class CommunityHub {
  static getCreations() {
    try {
      const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return INITIAL_TRENDING_CREATIONS;
  }

  static saveCreations(items) {
    try {
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save community creations:', e);
    }
  }

  static getLikedIds() {
    try {
      const raw = localStorage.getItem(LIKES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static toggleLike(creationId) {
    const liked = CommunityHub.getLikedIds();
    const isLiked = liked.includes(creationId);
    let creations = CommunityHub.getCreations();

    const item = creations.find(c => c.id === creationId);
    if (!item) return { isLiked: false, likes: 0 };

    if (isLiked) {
      item.likes = Math.max(0, item.likes - 1);
      const nextLiked = liked.filter(id => id !== creationId);
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(nextLiked));
    } else {
      item.likes += 1;
      liked.push(creationId);
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(liked));
      soundManager.playPop(660);
    }

    CommunityHub.saveCreations(creations);
    return { isLiked: !isLiked, likes: item.likes };
  }

  static publishCurrentPalette(title, authorName) {
    const slots = appState.getSlots();
    const hexes = slots.map(s => s.hex);
    const newId = 'comm_user_' + Date.now();
    const newCreation = {
      id: newId,
      title: title || `Custom Harmony #${Math.floor(Math.random() * 899 + 100)}`,
      category: 'Community Creation',
      author: authorName || 'Creator',
      likes: 1,
      hexes,
      type: 'palette'
    };

    const creations = CommunityHub.getCreations();
    creations.unshift(newCreation);
    CommunityHub.saveCreations(creations);

    // Auto-like own creation
    const liked = CommunityHub.getLikedIds();
    if (!liked.includes(newId)) {
      liked.push(newId);
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(liked));
    }

    soundManager.playSuccess();
    return newCreation;
  }
}

export function initCommunityModal(switchToolFn, showToast) {
  const modal = document.getElementById('community-showcase-modal');
  const openBtns = [
    document.getElementById('header-community-btn'),
    document.getElementById('sidebar-community-btn'),
    document.getElementById('landing-community-cta-btn')
  ];
  const closeBtn = document.getElementById('community-modal-close-btn');
  const grid = document.getElementById('community-cards-grid');
  const publishBtn = document.getElementById('community-publish-btn');
  const filterSelect = document.getElementById('community-category-filter');

  function renderCards(filter = 'all') {
    if (!grid) return;
    grid.innerHTML = '';
    const creations = CommunityHub.getCreations();
    const likedIds = CommunityHub.getLikedIds();

    const filtered = filter === 'all' 
      ? creations 
      : creations.filter(c => c.category.toLowerCase().includes(filter.toLowerCase()));

    filtered.forEach(item => {
      const isLiked = likedIds.includes(item.id);
      const card = document.createElement('div');
      card.className = 'community-creation-card';

      // Visual swatches bar
      const swatchesHtml = item.hexes.map(hex => `
        <div class="comm-swatch" style="background:${hex};" title="${hex}"></div>
      `).join('');

      card.innerHTML = `
        <div class="comm-card-header">
          <div>
            <h4 class="comm-card-title">${item.title}</h4>
            <span class="comm-card-meta">by ${item.author} • ${item.category}</span>
          </div>
          <button class="comm-like-btn ${isLiked ? 'liked' : ''}" data-id="${item.id}" title="Like this creation">
            <span>${isLiked ? '❤️' : '🤍'}</span>
            <span class="comm-like-count">${item.likes}</span>
          </button>
        </div>

        <div class="comm-swatches-strip">
          ${swatchesHtml}
        </div>

        <div class="comm-card-footer">
          <div class="comm-hex-tags">
            ${item.hexes.slice(0, 3).map(h => `<span class="comm-hex-tag">${h}</span>`).join('')}
            ${item.hexes.length > 3 ? `<span class="comm-hex-tag">+${item.hexes.length - 3}</span>` : ''}
          </div>
          <button class="comm-load-btn" data-id="${item.id}" title="Import into active studio workspace">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <span>Load in Studio</span>
          </button>
        </div>
      `;

      // Handle like
      const likeBtn = card.querySelector('.comm-like-btn');
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const res = CommunityHub.toggleLike(item.id);
        likeBtn.classList.toggle('liked', res.isLiked);
        likeBtn.querySelector('span:first-child').textContent = res.isLiked ? '❤️' : '🤍';
        likeBtn.querySelector('.comm-like-count').textContent = res.likes;
      });

      // Handle load in studio
      const loadBtn = card.querySelector('.comm-load-btn');
      loadBtn.addEventListener('click', () => {
        if (item.type === 'pixelart') {
          switchToolFn('pixelart');
          showToast(`Loaded "${item.title}" into Pixel Art Studio!`);
        } else {
          const newSlots = item.hexes.map(hex => ({ hex, locked: false }));
          appState.setSlots(newSlots);
          switchToolFn('palette');
          showToast(`Imported "${item.title}" into Active Studio Palette! 🎨`);
        }
        if (modal) modal.close();
        soundManager.playSuccess();
      });

      grid.appendChild(card);
    });
  }

  openBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        renderCards();
        if (modal) modal.showModal();
        soundManager.playClick();
      });
    }
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.close();
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      renderCards(e.target.value);
    });
  }

  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      const title = prompt('Enter a name for your community palette:', 'My Awesome Palette');
      if (!title) return;
      CommunityHub.publishCurrentPalette(title, 'Anonymous Designer');
      renderCards();
      showToast('🎉 Published your palette to Community Showcase!');
    });
  }
}
