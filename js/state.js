/**
 * Shared Application State for PixelCraft Studio
 * Powers the interconnected design system across Palette, Contrast, SVG, and Gradient tools.
 */

class AppState {
  constructor() {
    this.slots = [
      { hex: '#6366F1', locked: false },
      { hex: '#EC4899', locked: false },
      { hex: '#F59E0B', locked: false },
      { hex: '#10B981', locked: false },
      { hex: '#3B82F6', locked: false }
    ];
    this.activeContrastSlot = null; // Index of slot currently being inspected in Contrast
    this.listeners = [];
  }

  getSlots() {
    return this.slots;
  }

  getHexes() {
    return this.slots.map(s => s.hex);
  }

  setSlots(newSlots) {
    this.slots = newSlots;
    this.notify();
  }

  updateSlot(index, hex) {
    if (this.slots[index]) {
      this.slots[index].hex = hex.toUpperCase();
      this.notify();
    }
  }

  setActiveContrastSlot(index) {
    this.activeContrastSlot = index;
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.slots, this.activeContrastSlot);
      } catch (err) {
        console.error('Error in state listener:', err);
      }
    });
  }
}

export const appState = new AppState();
