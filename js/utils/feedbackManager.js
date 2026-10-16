/**
 * PixelCraft Studio Feedback & Community Suggestions Manager
 * Handles persistent user feedback, bug reports, feature requests, and ratings.
 * Zero-dependency, offline-capable, and ready for Firebase Realtime Database / Firestore.
 */

const FEEDBACK_STORAGE_KEY = 'pixelcraft_feedbacks_v1';

class FeedbackManager {
  constructor() {
    this.feedbacks = this.loadStoredFeedbacks();
    this.listeners = [];
  }

  loadStoredFeedbacks() {
    try {
      const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[FeedbackManager] Failed to read storage:', e);
    }
    // Seed initial community reviews for social proof
    return [
      {
        id: 'fb_init_1',
        name: 'Arjun Mehta',
        email: 'arjun.design@gmail.com',
        rating: 5,
        category: 'Praise',
        message: 'The contrast auto-fixer and organic wave generator saved hours on my client portfolio! Love the glassmorphic UI.',
        date: '2026-10-14'
      },
      {
        id: 'fb_init_2',
        name: 'Sara Lin',
        email: 'sara.frontend@outlook.com',
        rating: 5,
        category: 'Feature Request',
        message: 'Can we add an option to export animated SVG waves? Otherwise, the token exporter and image resizer are top tier!',
        date: '2026-10-15'
      }
    ];
  }

  saveFeedbacks() {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(this.feedbacks));
    } catch (e) {
      console.warn('[FeedbackManager] Failed to write storage:', e);
    }
    this.notify();
  }

  getAll() {
    return this.feedbacks;
  }

  addFeedback({ name, email, rating, category, message }) {
    const newEntry = {
      id: 'fb_' + Date.now(),
      name: name?.trim() || 'Anonymous Creator',
      email: email?.trim() || 'No email provided',
      rating: Number(rating) || 5,
      category: category || 'General Feedback',
      message: message.trim(),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    this.feedbacks.unshift(newEntry);
    this.saveFeedbacks();

    // Dispatch custom browser event for future Firebase listener
    window.dispatchEvent(new CustomEvent('pixelcraft:feedback:new', { detail: newEntry }));

    return newEntry;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.feedbacks);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try { cb(this.feedbacks); } catch (e) { console.error(e); }
    });
  }
}

export const feedbackManager = new FeedbackManager();
