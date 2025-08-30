# CollageForge Logo Usage Guide 🎨

## Logo Files Created

### **Primary Logos**
- `public/logo.svg` - Main horizontal logo (200×60px)
- `src/assets/logo-full.svg` - Detailed full logo with tagline (280×80px)
- `public/logo-compact.svg` - Compact version for headers (120×40px)

### **Favicons & Icons**
- `public/favicon.svg` - Modern SVG favicon (32×32px)
- `public/apple-touch-icon.svg` - iOS app icon (180×180px)
- `public/manifest.json` - PWA manifest with icon references

## Design Concept

### **Visual Elements**
1. **Collage Grid**: Four rectangles representing photo arrangement
2. **Magic Wand**: Creative tool with sparkles showing the "forge" concept
3. **Gradient Colors**: Purple to pink gradient representing creativity and energy
4. **Typography**: Bold "Collage" + accent "Forge" with tagline

### **Color Palette**
- **Primary Gradient**: `#667eea` → `#764ba2` (Blue to Purple)
- **Accent Gradient**: `#f093fb` → `#f5576c` (Pink to Coral)
- **Text**: White on colored backgrounds, gradient on light backgrounds
- **Theme Color**: `#667eea` (Primary blue)

## Logo Variations

### **1. Main Logo (`logo.svg`)**
- **Use**: Website headers, business cards, letterheads
- **Size**: 200×60px (scalable)
- **Background**: Works on dark backgrounds
- **Contains**: Icon + "CollageForge" text + tagline

### **2. Full Logo (`logo-full.svg`)**
- **Use**: Marketing materials, presentations, detailed branding
- **Size**: 280×80px (scalable)
- **Background**: Works on light backgrounds
- **Contains**: Detailed icon + full branding + subtitle

### **3. Compact Logo (`logo-compact.svg`)**
- **Use**: App headers, navigation bars, small spaces
- **Size**: 120×40px (scalable)
- **Background**: Transparent, works anywhere
- **Contains**: Simplified icon + text

### **4. Favicon (`favicon.svg`)**
- **Use**: Browser tabs, bookmarks, PWA icons
- **Size**: 32×32px (scalable)
- **Background**: Circular with brand colors
- **Contains**: Simplified collage grid + spark

### **5. App Icon (`apple-touch-icon.svg`)**
- **Use**: Mobile home screens, app stores
- **Size**: 180×180px (iOS standard)
- **Background**: Rounded rectangle with gradient
- **Contains**: Detailed collage grid + creative elements

## Usage Guidelines

### **Do's ✅**
- Use on contrasting backgrounds for readability
- Maintain aspect ratios when scaling
- Use SVG format when possible for crisp display
- Include sufficient white space around logos
- Use the compact version in tight spaces

### **Don'ts ❌**
- Don't stretch or distort the logo proportions
- Don't use on backgrounds that clash with the colors
- Don't recreate the logo in different colors
- Don't use low-resolution versions when SVG is available
- Don't place text too close to the logo

## Technical Implementation

### **HTML Integration**
```html
<!-- Favicon -->
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/apple-touch-icon.svg" />

<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json" />

<!-- Theme Color -->
<meta name="theme-color" content="#667eea" />
```

### **React Component Usage**
```jsx
// Main logo in header
<img src="/logo.svg" alt="CollageForge" style={{ height: '60px' }} />

// Compact logo in navigation
<img src="/logo-compact.svg" alt="CollageForge" style={{ height: '40px' }} />
```

## Brand Consistency

### **Typography Pairing**
- **Primary**: Arial, Helvetica, sans-serif
- **Weights**: Bold for headings, Medium for body text
- **Hierarchy**: Logo text should be the most prominent

### **Color Usage**
- Use the gradient colors for interactive elements
- White text on colored backgrounds
- Gradient text on light backgrounds
- Maintain color consistency across all materials

### **Spacing**
- Minimum clear space: 1/2 the height of the logo
- Align with other design elements
- Center or left-align based on layout needs

## File Formats & Sizes

| File | Format | Size | Use Case |
|------|--------|------|----------|
| `logo.svg` | SVG | 200×60px | Main branding |
| `logo-full.svg` | SVG | 280×80px | Marketing materials |
| `logo-compact.svg` | SVG | 120×40px | App headers |
| `favicon.svg` | SVG | 32×32px | Browser favicon |
| `apple-touch-icon.svg` | SVG | 180×180px | Mobile app icon |

## Future Considerations

### **Additional Formats Needed**
- PNG versions for email signatures
- High-res versions for print materials
- Monochrome versions for single-color applications
- Animated versions for loading states

### **Brand Extensions**
- Social media profile images
- Email signature logos
- Business card layouts
- Merchandise applications

---

**Brand Consistency**: Always use the official logo files and follow these guidelines to maintain CollageForge's professional brand identity across all touchpoints.