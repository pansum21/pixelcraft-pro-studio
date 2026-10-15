/**
 * Library & Vault Manager for PixelCraft Studio
 * Saves user favorites, color harmonies, gradients, and design presets to localStorage.
 * Restores them directly into the active workspace via appState.
 */

import { appState } from '../state.js';
import { soundManager } from './soundEffects.js';

const STORAGE_KEY = 'pixelcraft_vault_presets_v1';

export class LibraryManager {
  static getItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : LibraryManager.getDefaultPresets();
    } catch (e) {
      return LibraryManager.getDefaultPresets();
    }
  }

  static saveItems(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Storage full or error saving library:', e);
    }
  }

  static getStoredUser() {
    try {
      const raw = localStorage.getItem('pixelcraft_google_auth_v1');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  static saveCurrentPalette(customName) {
    const slots = appState.getSlots();
    const hexes = slots.map(s => s.hex);
    const name = customName || `Palette #${Math.floor(Math.random() * 899 + 100)}`;
    const user = LibraryManager.getStoredUser();
    const newItem = {
      id: 'palette_' + Date.now(),
      type: 'palette',
      name,
      createdAt: new Date().toLocaleDateString(),
      cloudSynced: !!user,
      author: user ? user.name : 'Local Session',
      data: {
        hexes,
        slots: JSON.parse(JSON.stringify(slots))
      }
    };

    const items = LibraryManager.getItems();
    items.unshift(newItem);
    LibraryManager.saveItems(items);
    soundManager.playPop(620);
    return newItem;
  }

  static saveGradient(name, css, stops) {
    const newItem = {
      id: 'grad_' + Date.now(),
      type: 'gradient',
      name: name || `Gradient Glow #${Math.floor(Math.random() * 899 + 100)}`,
      createdAt: new Date().toLocaleDateString(),
      data: { css, stops }
    };
    const items = LibraryManager.getItems();
    items.unshift(newItem);
    LibraryManager.saveItems(items);
    soundManager.playPop(620);
    return newItem;
  }

  static deleteItem(id) {
    let items = LibraryManager.getItems();
    items = items.filter(item => item.id !== id);
    LibraryManager.saveItems(items);
    soundManager.playClick();
  }

  static restoreItem(id, switchToolFn, showToast) {
    const items = LibraryManager.getItems();
    const item = items.find(it => it.id === id);
    if (!item) return false;

    if (item.type === 'palette') {
      const restoredSlots = item.data.slots.map(s => ({
        hex: s.hex,
        locked: false
      }));
      appState.setSlots(restoredSlots);
      if (switchToolFn) switchToolFn('palette');
      if (showToast) showToast(`Restored palette "${item.name}" into workspace!`);
      soundManager.playPop(580);
      return true;
    } else if (item.type === 'gradient') {
      if (switchToolFn) switchToolFn('gradient');
      if (showToast) showToast(`Loaded gradient "${item.name}"!`);
      soundManager.playPop(580);
      return true;
    }
    return false;
  }

  static getDefaultPresets() {
    return [
      {
        id: 'preset_cyberpunk',
        type: 'palette',
        name: 'Cyberpunk Neon Matrix',
        createdAt: 'Pro Preset',
        data: {
          hexes: ['#050814', '#06B6D4', '#EC4899', '#8B5CF6', '#FACC15'],
          slots: [
            { hex: '#050814', locked: false },
            { hex: '#06B6D4', locked: false },
            { hex: '#EC4899', locked: false },
            { hex: '#8B5CF6', locked: false },
            { hex: '#FACC15', locked: false }
          ]
        }
      },
      {
        id: 'preset_california',
        type: 'palette',
        name: 'Pacific Sunset Glow',
        createdAt: 'Pro Preset',
        data: {
          hexes: ['#F97316', '#FB7185', '#E11D48', '#831843', '#312E81'],
          slots: [
            { hex: '#F97316', locked: false },
            { hex: '#FB7185', locked: false },
            { hex: '#E11D48', locked: false },
            { hex: '#831843', locked: false },
            { hex: '#312E81', locked: false }
          ]
        }
      },
      {
        id: 'preset_emerald',
        type: 'palette',
        name: 'Deep Nordic Forest',
        createdAt: 'Pro Preset',
        data: {
          hexes: ['#064E3B', '#047857', '#10B981', '#34D399', '#A7F3D0'],
          slots: [
            { hex: '#064E3B', locked: false },
            { hex: '#047857', locked: false },
            { hex: '#10B981', locked: false },
            { hex: '#34D399', locked: false },
            { hex: '#A7F3D0', locked: false }
          ]
        }
      }
    ];
  }
}
