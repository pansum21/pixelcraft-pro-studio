# 🎨 PixelCraft Studio

> **Modern Design & Media Tools Hub** — Lightweight, high-performance, client-side web tools built with pure **Vanilla HTML5, CSS3, and JavaScript (ES6 Modules)**. Zero build tools or heavy framework dependencies required.

---

## 🛠️ Included Tools

### 1. 🎨 Color Palette Generator & Harmonies (`#palette`)
- **Smart Generation**: Generate palettes based on color theory harmonies: *Complementary*, *Analogous*, *Triadic*, *Monochromatic*, *Tetradic*, *Split-Complementary*, or *Random Aesthetic*.
- **Slot Locking**: Lock your favorite colors while re-rolling the rest.
- **Keyboard Shortcut**: Tap <kbd>Spacebar</kbd> anytime to generate fresh color variations.
- **Multi-Format Export**: Export palettes as CSS Custom Properties (`:root`), Tailwind CSS configuration object, JSON, raw SVG strip, or download a high-res swatch PNG.
- **Instant Copy**: Copy HEX, RGB, or HSL with 1 click.

### 2. 🔍 WCAG Color Contrast Checker (`#contrast`)
- **Accurate Standards**: Computes exact WCAG 2.1 relative luminance and contrast ratio.
- **Compliance Matrix**: Evaluates compliance for WCAG AA (Normal 4.5:1, Large 3:1), WCAG AAA (Normal 7:1, Large 4.5:1), and UI Components & Graphical Objects (3:1).
- **Auto-Fixer Magic**: Mathematically calculates and shifts the lightness channel to meet AA or AAA standards with one click!
- **Live Interactive Preview**: Preview text headings, body copy, solid action buttons, outline buttons, and card borders in real time.

### 3. 📐 SVG Viewer & Optimizer (`#svg`)
- **Live Preview & Inspection**: Pan and zoom inside an interactive viewport with checkerboard transparency, dark, and light backgrounds.
- **SVG Optimizer / Minifier**: Strips XML declarations, doctypes, comments, and redundant editor metadata (Inkscape, Sketch, Illustrator), showing live byte savings.
- **Export Options**: Export as high-resolution PNG (1x, 2x Retina, 4x Ultra-HD) or copy Data URI for CSS/HTML.

### 4. 🖼️ Image Resizer & Converter (`#image`)
- **100% Client-Side & Private**: Uses HTML5 Canvas API—no images are uploaded to any server.
- **Dimension Controls**: Resize by exact pixel dimensions with aspect ratio lock, or scale by quick percentages (25%, 50%, 75%, 200%).
- **Aspect Ratio Presets**: 1:1 (Avatar/Square), 16:9 (Hero/Thumbnail), 9:16 (Story/Mobile), 4:3, and 3:2.
- **Format Conversion & Compression**: Convert between PNG, JPEG, and WebP with real-time compression quality slider and estimated file size calculation.

### 5. ✨ CSS Gradient & Glassmorphism Studio (`#gradient`)
- **Gradient Designer**: Linear, radial, and conic gradient generator with angle slider, customizable color stops, and curated preset themes (Aurora, Sunset, Cyberpunk, Midnight).
- **Frosted Glassmorphism**: Interactive backdrop-blur, background opacity, and border styling with live card preview and one-click CSS copy.

---

## 🚀 How to Run

Because ES Modules (`import/export`) are used, serve the folder with any static web server:

### Option A: Using the built-in Node server
```bash
node server.js
```
Then open: **http://localhost:3000**

### Option B: Using npx serve / http-server
```bash
npx serve .
```

---

## ⌨️ Keyboard Shortcuts
- <kbd>Spacebar</kbd> — Generate new color palette
- <kbd>1</kbd> — Switch to Color Palette Generator
- <kbd>2</kbd> — Switch to WCAG Contrast Checker
- <kbd>3</kbd> — Switch to SVG Studio
- <kbd>4</kbd> — Switch to Image Resizer
- <kbd>5</kbd> — Switch to Gradient & Glassmorphism Studio

---

## 📁 Project Structure

```
design-tools-hub/
├── index.html           # Main semantic HTML5 shell
├── server.js            # Zero-dependency local Node.js static server
├── package.json         # Project metadata and start scripts
├── README.md            # Documentation and instructions
├── css/
│   └── style.css        # Modern CSS with dark/light themes & responsive layout
└── js/
    ├── app.js           # Core controller, tab navigation, and theme manager
    ├── utils/
    │   └── colorUtils.js # Color conversions (HEX/RGB/HSL), WCAG luminance, harmonies
    └── tools/
        ├── palette.js    # Palette generator, locking, and export modal
        ├── contrast.js   # Contrast checker, auto-fixer, and interactive preview
        ├── svgViewer.js  # SVG renderer, minifier, and PNG exporter
        ├── imageResizer.js # Canvas-based image resizer and format converter
        └── gradient.js   # CSS gradient and glassmorphism studio
```
