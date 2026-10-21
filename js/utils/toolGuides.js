/**
 * PixelCraft Studio — Complete Beginner Guidelines & How-It-Works Knowledge Base
 * Detailed, step-by-step instructions for all 11 interconnected tools.
 */

export const TOOL_GUIDES = {
  palette: {
    id: 'palette',
    num: '01',
    name: 'Color Palette Studio',
    tagline: 'Harmonious Color Generation & Algorithmic Shading',
    icon: '🎨',
    category: 'Color Engineering',
    purpose: 'Generate mathematically balanced 5-color palettes using acoustic harmony algorithms (Complementary, Analogous, Triadic, Tetradic, Monochromatic, Split-Complementary).',
    whoFor: 'UI/UX designers creating design systems, developers styling components, branding creators.',
    steps: [
      'Press Spacebar or click "🎲 Randomize" to generate fresh harmonious colors instantly.',
      'Click the 🔒 Padlock icon on any color column to lock it in place while randomizing the remaining swatches.',
      'Select a harmony model (Analogous, Complementary, Triadic, etc.) from the harmony dropdown.',
      'Click on any HEX code to copy it, or click the color input to manually fine-tune with the native eyedropper.',
      'Explore the generated 10-shade tonal ramp (50 to 900) at the bottom for Tailwind-style design scales.',
      'Click "Export Palette" to download swatch PNGs, CSS Custom Properties, or Tailwind config.'
    ],
    shortcuts: [
      'Spacebar: Generate new palette',
      'Click Hex: Instant copy to clipboard',
      '1 - 0: Switch between Studio tools'
    ],
    proTip: 'Colors in Palette Studio automatically synchronize with WCAG Contrast Inspector, Gradients, and Component Sandbox in real-time!'
  },

  contrast: {
    id: 'contrast',
    num: '02',
    name: 'WCAG Contrast Inspector',
    tagline: 'Accessibility Auditing with 1-Click Smart Auto-Fix',
    icon: '⚡',
    category: 'Accessibility (a11y)',
    purpose: 'Validate text and background color readability according to international WCAG 2.1 (AA & AAA) standards and APCA contrast scoring.',
    whoFor: 'Designers ensuring accessible web standards, developers aiming for high Google Lighthouse SEO scores, product owners.',
    steps: [
      'Select a Foreground (Text) color and a Background color.',
      'Check the real-time contrast ratio score (e.g., 21.0:1) and the pass/fail badges for Normal Text (4.5:1), Large Text (3.0:1), and UI Components.',
      'If the combination fails, click "✨ Smart Auto-Fix Contrast" — the algorithm calculates the exact minimal luminance shift needed to achieve AA/AAA compliance while preserving color hue!',
      'Test your colors across 4 color blindness simulations (Protanopia, Deuteranopia, Tritanopia, Achromatopsia) to ensure universal accessibility.'
    ],
    shortcuts: [
      'Click Auto-Fix: Solves failing contrast automatically',
      'Reverse Button: Swaps foreground and background colors'
    ],
    proTip: 'A contrast ratio of 4.5:1 is required by Google for standard text. Failing this can hurt your search ranking and accessibility compliance.'
  },

  extractor: {
    id: 'extractor',
    num: '03',
    name: 'Image Palette Extractor',
    tagline: 'Extract Vibrant Dominant Swatches from Photos & Assets',
    icon: '📸',
    category: 'Asset Processing',
    purpose: 'Analyze any photo, brand logo, or UI mockup and extract the 5 to 8 most prominent, vibrant color swatches using client-side canvas quantization.',
    whoFor: 'Designers sampling colors from reference photography, creators building palettes from brand imagery.',
    steps: [
      'Drag & drop any image (PNG, JPG, WebP) into the upload dropzone, or click to browse.',
      'The client-side canvas engine instantly scans image pixels with 0 server uploads (100% private).',
      'Review the extracted palette swatches with their color names and hex values.',
      'Click "Push to Palette Studio" to import these extracted colors directly into your main studio workspace.'
    ],
    shortcuts: [
      'Drag and drop: Instant image processing',
      'Click swatch: Copy hex code'
    ],
    proTip: 'Use high-contrast images or brand banners to extract cohesive complementary primary and accent colors.'
  },

  svg: {
    id: 'svg',
    num: '04',
    name: 'SVG Vector Forge',
    tagline: 'Live Vector Inspection, Optimization & Rasterization',
    icon: '📐',
    category: 'Vector Graphics',
    purpose: 'Inspect raw SVG code, optimize paths, adjust dimensions, override fill and stroke colors on the fly, and export as crisp SVG or high-resolution PNG.',
    whoFor: 'Frontend developers formatting icons, UI designers tweaking vector graphics, SVG animators.',
    steps: [
      'Paste raw `<svg>` code into the code editor or upload an `.svg` file.',
      'The live preview updates instantaneously with transparent checkerboard background.',
      'Adjust viewBox width, height, and scale sliders to normalize inconsistent icon bounds.',
      'Override fill or stroke colors using your active palette colors.',
      'Click "Export Optimized SVG" to download clean code, or "Export High-Res PNG" for raster graphics.'
    ],
    shortcuts: [
      'Ctrl + V: Paste SVG directly',
      'Click Export PNG: Renders SVG at 2x/4x retina resolution'
    ],
    proTip: 'Normalize your icon set to a uniform 24x24 or 32x32 viewBox for perfect alignment in modern CSS frameworks.'
  },

  wave: {
    id: 'wave',
    num: '05',
    name: 'Wave & Section Dividers',
    tagline: 'Organic Bezier Page Dividers for Modern Landing Pages',
    icon: '🌊',
    category: 'Layout Dividers',
    purpose: 'Generate fluid, organic, layered SVG wave dividers and curvy section breaks that eliminate boring straight horizontal lines on websites.',
    whoFor: 'Web designers building modern hero sections, SaaS landing page developers, UI creators.',
    steps: [
      'Select wave style: Smooth Waves, Peaks, Steps, or Layered Multi-Waves.',
      'Adjust sliders: Wave Height, Frequency (number of waves), and Smoothness.',
      'Toggle layers (1 to 3 overlapping waves) and customize colors with opacity blending.',
      'Click "Flip Horizontal" or "Invert Vertical" to position the divider at the top or bottom of a section.',
      'Copy the production-ready SVG snippet or CSS code and paste it directly into your HTML/CSS file.'
    ],
    shortcuts: [
      'Randomize: Generates novel organic curve combinations',
      'Copy SVG: Directly pasteable into web templates'
    ],
    proTip: 'Place wave dividers between contrasting light and dark sections to create natural visual flow on landing pages.'
  },

  shadow: {
    id: 'shadow',
    num: '06',
    name: 'Layered Shadows & Ambient Glow',
    tagline: 'Multi-Elevation Depth & Specular Neon Glows',
    icon: '🔲',
    category: 'Depth & Lighting',
    purpose: 'Eliminate harsh, muddy single-layer CSS shadows by compounding multiple delicate shadow layers for realistic optical depth and ambient neon glows.',
    whoFor: 'Designers building realistic card elevations, dark mode UI architects, button stylists.',
    steps: [
      'Choose a preset: Subtle Elevation, Float Card, Ambient Neon Glow, or Heavy Deep Shadow.',
      'Adjust the Elevation slider (levels 1 through 6) to control physical height perception.',
      'Fine-tune Blur, Spread, and Opacity compounding.',
      'Toggle "Colored Ambient Glow" and pick a glow tint (e.g., Indigo or Cyan) matching your brand.',
      'Click "Copy CSS box-shadow" to grab the multi-layered CSS declaration for your stylesheets.'
    ],
    shortcuts: [
      '1 - 6 Elevation presets: Instant depth scaling',
      'Light/Dark canvas toggle: Test shadow against different backgrounds'
    ],
    proTip: 'Compounding 3 to 5 subtle shadows with low opacity looks 10x more realistic than a single dark shadow.'
  },

  gradient: {
    id: 'gradient',
    num: '07',
    name: 'Gradients & Glassmorphism',
    tagline: 'Multi-Stop Shader Generator & Frosted Glass Presets',
    icon: '🔮',
    category: 'CSS Styling',
    purpose: 'Design stunning multi-stop CSS gradients (Linear, Radial, Conic) paired with realistic frosted glass (backdrop-filter blur, specular borders, semi-transparent fills).',
    whoFor: 'Web developers creating futuristic cards, hero background designers, Glassmorphism enthusiasts.',
    steps: [
      'Select gradient type: Linear, Radial, or Conic.',
      'Adjust the angle wheel (0° to 360°) to direct the light path.',
      'Add or drag color stop pins on the gradient timeline. Click "Import from Palette" to use active studio colors.',
      'Toggle the Glassmorphism overlay: adjust Backdrop Blur (px), Transparency (%), and Border Shine.',
      'Copy the generated CSS snippet including `background`, `backdrop-filter`, and border styles.'
    ],
    shortcuts: [
      'Click track: Add new color stop',
      'Import Palette: Instantly fills stops from Palette Studio'
    ],
    proTip: 'Always pair `backdrop-filter: blur(12px)` with a subtle white border `rgba(255,255,255,0.12)` for genuine glass refraction.'
  },

  codecard: {
    id: 'codecard',
    num: '08',
    name: 'Code & Text Beautifier',
    tagline: 'Turn Code Snippets into Social-Ready Visual Cards',
    icon: '💻',
    category: 'Developer Media',
    purpose: 'Transform plain code text into beautiful, syntax-highlighted screenshot cards with macOS-style window chrome, gradient padding, and custom watermarks.',
    whoFor: 'Developers sharing code on X/Twitter/LinkedIn, technical bloggers, tutorial creators.',
    steps: [
      'Paste your code snippet into the editor and choose your language (JavaScript, CSS, HTML, Python, etc.).',
      'Select a background theme (Midnight Indigo, Sunset Glow, Neon Matrix, or Clean Slate).',
      'Toggle window controls (macOS colored dots, Windows icons, or minimal borderless).',
      'Set custom card title and padding.',
      'Click "Download High-Res PNG" or "Copy to Clipboard" to share instantly on social media.'
    ],
    shortcuts: [
      'Ctrl + Enter: Quick re-render',
      'Download PNG: Renders retina-crisp snapshot'
    ],
    proTip: 'Keep snippets concise (under 20 lines) for maximum readability and engagement on social feeds.'
  },

  image: {
    id: 'image',
    num: '09',
    name: 'High-Res Image Resizer',
    tagline: 'Zero-Upload Client-Side Fast Batch Compression',
    icon: '🖼️',
    category: 'Image Processing',
    purpose: 'Crop, resize, and convert images into modern WebP, PNG, or JPEG formats directly in browser memory without sending private photos to any server.',
    whoFor: 'Webmasters optimizing hero images for Core Web Vitals (LCP), digital marketers, content creators.',
    steps: [
      'Drag and drop an image file into the dropzone.',
      'Enter target dimensions (Width x Height) or select standard social presets (Instagram, Twitter, Favicon).',
      'Enable "Lock Aspect Ratio" to prevent image distortion.',
      'Choose output format (WebP for modern web speed, PNG for transparency, JPEG for photos) and set Quality slider (e.g., 85%).',
      'Click "Process & Download" to get the optimized file instantly.'
    ],
    shortcuts: [
      'WebP Toggle: Typically reduces image size by 30-50% with zero visual loss',
      'Preset pills: 1-click popular social media dimensions'
    ],
    proTip: 'Convert PNGs to WebP at 85% quality to significantly boost your website page speed and Google PageSpeed Insights score.'
  },

  favicon: {
    id: 'favicon',
    num: '10',
    name: 'Favicon & App Icon Studio',
    tagline: 'All-Device Favicon Package & PWA Web Manifest Generator',
    icon: '🏷️',
    category: 'PWA & Branding',
    purpose: 'Convert any image, logo, or emoji into a complete multi-resolution favicon bundle (16x16, 32x32, 48x48, 180x180 Apple Touch, 192x192, 512x512 PWA) with ready-to-paste HTML meta tags.',
    whoFor: 'Full-stack developers launching web apps, PWA builders, designers creating complete favicon packages.',
    steps: [
      'Choose your source: Upload an image/logo OR pick any Emoji with a custom background.',
      'Adjust shape: Rounded Square, Smooth Squircle, or Full Circle.',
      'Preview real-time how your icon looks in a simulated browser tab and smartphone home screen.',
      'Click "Download Complete Favicon Package" to receive all standard sizes plus `site.webmanifest`.',
      'Copy the generated `<link rel="icon">` HTML snippet directly into your `<head>` tag.'
    ],
    shortcuts: [
      'Emoji mode: Create a clean branded favicon in 5 seconds without design software',
      'Copy HTML: Direct pasteable meta tags'
    ],
    proTip: 'Modern browsers prioritize 32x32 for desktop tabs and 180x180 for iOS bookmarks. Generating the full suite ensures crisp icons on every device.'
  },

  sandbox: {
    id: 'sandbox',
    num: '11',
    name: 'Live Component Sandbox',
    tagline: 'Zero-Delay Isolated HTML/CSS Component Testing Frame',
    icon: '🧪',
    category: 'Rapid Prototyping',
    purpose: 'Test buttons, cards, modals, and animations inside a sandboxed iframe that automatically inherits your active palette colors and gradient tokens.',
    whoFor: 'Frontend developers rapid-prototyping UI components, designers testing contrast in real elements.',
    steps: [
      'Select a template component (Glassmorphic Card, Modern Glow Button, Pricing Card, Hero Banner).',
      'Edit the live HTML and CSS code in the side-by-side editors.',
      'The preview frame updates in real time as you type.',
      'Click "Apply Active Studio Palette" to instantly re-skin the component with your current color palette!',
      'Copy clean HTML & CSS to drop directly into your production project.'
    ],
    shortcuts: [
      'Ctrl + S: Force re-render preview',
      'Responsive switcher: Test component at Mobile (375px), Tablet (768px), or Desktop (100%)'
    ],
    proTip: 'Use Sandbox to test your components against both dark and light modes before putting them in production.'
  },

  pixelart: {
    id: 'pixelart',
    num: '12',
    name: '8-Bit Pixel Art Studio & Sprite Animator',
    tagline: 'Retro Sprite Drawing & In-Browser Animation Engine',
    icon: '👾',
    category: 'Creative Illustration',
    purpose: 'Design pixel-perfect 8-bit sprites, game assets, retro icons, and multi-frame animations with onion-skinning, all rendered 100% in-browser.',
    whoFor: 'Game developers, digital illustrators, retro aesthetic fans, NFT and indie artists.',
    steps: [
      'Choose your grid resolution: 16x16 (classic NES/GameBoy), 24x24, 32x32, or 48x48.',
      'Select a drawing tool: Pencil, Eraser, Flood Fill (Paint Bucket), Eyedropper, or Line Tool.',
      'Turn on Symmetry Mode (Mirror Draw) to automatically craft perfectly symmetrical characters and game shields.',
      'Draw multiple frames using the "Add Frame" button, adjust FPS (1-24 fps), and toggle Onion Skinning to view the previous frame faint ghost.',
      'Export crisp pixel PNGs (up to 32x scaling with zero blur) or full horizontal Sprite Sheets ready for Unity, Godot, or web games.'
    ],
    shortcuts: [
      'P: Pencil tool | E: Eraser | B: Paint bucket | I: Eyedropper',
      'Ctrl+Z: Undo | Ctrl+Y: Redo',
      'Spacebar in Animation: Play/Pause sprite preview'
    ],
    proTip: 'Colors crafted in your Palette Studio automatically populate your Pixel Art swatches so your artwork stays perfectly on-brand!'
  }
};
