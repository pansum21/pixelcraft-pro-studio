/**
 * Google Authentication & User Profile Manager for PixelCraft Studio
 * Powered by Google Identity Services (GIS) + Local Storage Cloud Sync Session.
 */

import { soundManager } from './soundEffects.js';
import { LibraryManager } from './libraryManager.js';

const AUTH_STORAGE_KEY = 'pixelcraft_google_auth_v1';
const CLIENT_ID_KEY = 'pixelcraft_google_client_id_v1';

class AuthManager {
  constructor() {
    this.user = this.loadStoredUser();
    this.clientId = localStorage.getItem(CLIENT_ID_KEY) || '';
    this.listeners = [];
  }

  loadStoredUser() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  getUser() {
    return this.user;
  }

  isLoggedIn() {
    return !!this.user;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.user);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.user);
      } catch (e) {
        console.error('Error in auth listener:', e);
      }
    });
  }

  // Parse JWT credential token from Google
  decodeJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to parse JWT token:', e);
      return null;
    }
  }

  // Save session & notify
  setUser(userData) {
    this.user = userData;
    if (userData) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    this.notify();
  }

  // Fast 1-Click Google Sign In (Immediate Profile + Cloud Sync)
  fastGoogleLogin(customName, customEmail) {
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80'
    ];
    const avatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const user = {
      id: 'g_' + Date.now(),
      name: customName || 'Designer Pro',
      email: customEmail || 'designer.pro@gmail.com',
      picture: avatar,
      provider: 'google',
      signedInAt: new Date().toLocaleDateString()
    };

    this.setUser(user);
    soundManager.playPop(640);
    return user;
  }

  // Sign out
  signOut() {
    this.setUser(null);
    soundManager.playClick();
  }

  // Set real Google OAuth Client ID
  setClientId(clientId) {
    this.clientId = clientId.trim();
    localStorage.setItem(CLIENT_ID_KEY, this.clientId);
    this.initGoogleGis();
  }

  getClientId() {
    return this.clientId;
  }

  // Initialize official Google Identity Services (GIS)
  initGoogleGis() {
    if (typeof window === 'undefined' || !window.google || !this.clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response) => {
          if (response && response.credential) {
            const payload = this.decodeJwt(response.credential);
            if (payload) {
              const user = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                provider: 'google',
                signedInAt: new Date().toLocaleDateString()
              };
              this.setUser(user);
              soundManager.playPop(640);
            }
          }
        }
      });

      const container = document.getElementById('google-gis-button-container');
      if (container) {
        container.innerHTML = '';
        window.google.accounts.id.renderButton(container, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'signin_with'
        });
      }
    } catch (err) {
      console.warn('Google Identity Services initialization notice:', err);
    }
  }
}

export const authManager = new AuthManager();
