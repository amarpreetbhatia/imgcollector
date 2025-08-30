# Code Walkthrough - Image Crawler Application

## Architecture Overview

This is a full-stack React + Node.js application that crawls websites to extract and display images with secure bulk download and collage creation capabilities. The application follows a client-server architecture with service worker isolation for downloads and canvas-based image processing.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Material-UI + Vite
- **Backend**: Node.js + Express + Cheerio + Axios
- **Download System**: Service Worker + JSZip + Security Validation
- **Collage System**: HTML5 Canvas + Image Processing + Print Integration
- **Testing**: Vitest + React Testing Library

## Step-by-Step Code Flow

### Phase 1: Application Bootstrap
1. **Entry Point** (`src/index.tsx`) → React root setup with Material-UI theme
2. **Main App** (`src/App.tsx`) → State management and component routing
3. **Welcome Screen** (`src/components/WelcomeScreen.tsx`) → URL input and validation

### Phase 2: Web Crawling Process
1. **URL Submission** → Frontend validation and normalization
2. **API Request** (`src/utils/crawler.ts`) → Backend communication
3. **Server Processing** (`server/server.js`) → Web crawling and image extraction
4. **Response Handling** → Image data parsing and state updates

### Phase 3: Image Display & Interaction
1. **Carousel Rendering** (`src/components/ImageCarousel.tsx`) → Grid/carousel view modes
2. **Image Loading** → Error handling and responsive display
3. **User Interactions** → Full-screen preview, source navigation

### Phase 4: Advanced Features
1. **Download System** → Service worker background processing
2. **Collage Creation** → Multi-select and canvas generation
3. **Print Integration** → Printful API and order management

## Project Structure

```
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── ImageCarousel.tsx    # Enhanced with download functionality
│   │   └── WelcomeScreen.tsx    # URL input component
│   ├── utils/             # Utility functions
│   │   ├── crawler.ts          # Backend API communication
│   │   ├── downloadService.ts  # Download service with worker management
│   │   └── securityConfig.ts   # Security configuration and validation
│   ├── styles/            # CSS styles
│   ├── test/              # Test files
│   └── types.ts           # TypeScript interfaces with download types
├── server/                # Node.js backend
│   └── server.js          # Express server with crawling logic
└── public/                # Static assets
    ├── download-worker.js      # Service worker for secure downloads
    └── index.html             # Main HTML template
```

## Detailed Component Architecture

### 1. Application Bootstrap (`src/index.tsx`)
**Purpose**: Application initialization and theme setup
**Key Operations:**
- React 18 root creation with `createRoot()`
- Material-UI theme provider with dark theme
- Global CSS baseline and typography setup
- Error boundary setup for graceful failure handling

### 2. Main Application Controller (`src/App.tsx`)
**Purpose**: Central state management and routing logic
**State Management:**
```typescript
const [images, setImages] = useState<ImageData[]>([]);     // Crawled image data
const [isLoading, setIsLoading] = useState(false);         // Crawl progress state
const [showCarousel, setShowCarousel] = useState(false);   // View state toggle
```

**Component Flow:**
```
App (State Controller)
├── WelcomeScreen (URL Input) → triggers crawl
└── ImageCarousel (Image Display) → shows results
```

**Key Algorithms:**
- **State Transitions**: Welcome → Loading → Results → Back to Welcome
- **Error Recovery**: Reset state on crawl failures
- **Data Persistence**: Maintain image data until new crawl initiated

### 3. URL Input & Crawl Initiation (`src/components/WelcomeScreen.tsx`)
**Purpose**: User input handling and crawl process initiation
**Step-by-Step Process:**
1. **URL Input Validation**
   ```typescript
   const normalizeUrl = (url: string): string => {
     if (!url.startsWith('http://') && !url.startsWith('https://')) {
       return `https://${url}`;
     }
     return url;
   };
   ```
2. **Progress Simulation Algorithm**
   ```typescript
   // Simulated progress: 0-90% during crawl, 100% on completion
   const updateProgress = () => {
     setProgress(prev => Math.min(prev + Math.random() * 15, 90));
   };
   ```
3. **API Communication**
   - Calls `crawler.crawlImages(url)` from utils
   - Handles loading states and error conditions
   - Triggers parent state updates on success

**Error Handling Strategy:**
- Network failures → User-friendly error messages
- Invalid URLs → Automatic normalization attempts
- Server errors → Detailed error display with retry options

### 4. Image Display & Interaction Hub (`src/components/ImageCarousel.tsx`)
**Purpose**: Multi-modal image display with advanced interaction features
**Core State Architecture:**
```typescript
// Display Management
const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('carousel');

// Download System Integration
const [isDownloading, setIsDownloading] = useState(false);
const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);

// Collage System Integration  
const [selectionMode, setSelectionMode] = useState(false);
const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
const [collagePreview, setCollagePreview] = useState<{blob: Blob | null; url: string | null}>();
```

**Step-by-Step User Interactions:**

**A. Image Display Flow:**
1. **Error Handling**: `handleImageError()` removes failed images from display
2. **View Mode Toggle**: Switch between carousel and grid layouts
3. **Image Selection**: Click handling for preview or multi-select modes
4. **Full-Screen Preview**: Modal dialog with source attribution

**B. Download Process Flow:**
1. **Initiation**: `handleDownload()` → validates images → calls `downloadService`
2. **Progress Tracking**: Real-time updates via service worker messages
3. **Completion**: Automatic file download + success notification
4. **Error Recovery**: Cancel functionality + error message display

**C. Collage Creation Flow:**
1. **Selection Mode**: Toggle multi-select with visual indicators
2. **Image Selection**: Max 5 images with numbered badges
3. **Generation**: `handleGenerateCollage()` → `collageService.generateCollage()`
4. **Preview**: `CollagePreviewDialog` with print integration

**Download Integration:**
- Smart button states (Download All/Cancel based on state)
- Real-time progress tracking with LinearProgress component
- Error handling with Snackbar notifications
- Success feedback and automatic cleanup
- Download cancellation support

**Collage Integration:**
- Toggle selection mode for multi-select
- Visual selection indicators with numbered badges
- Maximum 5 image selection limit
- Real-time selection counter
- Integrated collage generation and download

**Responsive Breakpoints:**
```javascript
superLargeDesktop: 5 items (1400px+)
desktop: 4 items (1024-1400px)
tablet: 2 items (464-1024px)
mobile: 1 item (0-464px)
```

**UI State Logic:**
```javascript
// Button visibility and states
downloadButton: enabled when images > 0 && !selectionMode && !downloading
collageButton: toggles selectionMode, shows selection count
generateButton: enabled when selectedImages.size > 0
cancelButton: shown only during active download
```

## Backend Crawling Engine (`server/server.js`)

### Step-by-Step Crawling Process

**Phase 1: Initialization & Validation**
```javascript
class ImageCrawler {
  async crawlImages(startUrl) {
    // 1. Reset crawler state
    this.visitedUrls = new Set();
    this.foundImages = new Set();
    this.startTime = Date.now();
    
    // 2. Validate and normalize URL
    const url = new URL(startUrl);
    this.domain = url.hostname;
    
    // 3. Check robots.txt compliance
    await this.checkRobotsTxt(url);
  }
}
```

**Phase 2: Recursive Page Crawling**
```javascript
async crawlPage(url, depth = 0) {
  // Termination conditions check
  if (this.shouldStop() || depth > 1) return;
  
  // 1. Fetch page content with timeout
  const response = await axios.get(url, { timeout: 10000 });
  
  // 2. Parse HTML with Cheerio
  const $ = cheerio.load(response.data);
  
  // 3. Extract images from current page
  await this.extractImages($, url);
  
  // 4. Extract and follow internal links (depth + 1)
  if (depth === 0) {
    await this.followLinks($, url, depth + 1);
  }
}
```

**Phase 3: Image Extraction Algorithm**
```javascript
async extractImages($, pageUrl) {
  $('img').each((index, element) => {
    const src = $(element).attr('src');
    const alt = $(element).attr('alt');
    
    // 1. Convert relative to absolute URL
    const imageUrl = new URL(src, pageUrl).href;
    
    // 2. Apply filtering rules
    if (this.shouldSkipImage(imageUrl, element)) return;
    
    // 3. Store image data
    this.foundImages.add({
      url: imageUrl,
      sourceUrl: pageUrl,
      alt: alt || ''
    });
  });
}
```

**Crawling Rules & Limits:**
- **Time Limit**: 180 seconds (3 minutes) maximum
- **Image Limit**: 50 images maximum per crawl
- **Depth Limit**: 2 levels (main page + 1 level of internal links)
- **Domain Restriction**: Only same-domain links followed
- **Robots.txt Compliance**: Respects crawl permissions
- **Rate Limiting**: Built-in delays via timeout mechanisms

**Image Filtering Logic:**
```javascript
// Skip tiny images (tracking pixels)
if (width < 50 || height < 50) skip;

// Skip tracking/analytics images
if (url.includes('tracking|analytics|beacon')) skip;

// Skip duplicate URLs
if (foundImages.has(url)) skip;
```

### API Endpoints
- `POST /api/crawl`: Main crawling endpoint
- `GET /health`: Server health check

## Frontend-Backend Communication (`src/utils/crawler.ts`)

**API Client Pattern:**
- Singleton ImageCrawler class
- Fetch-based HTTP client with error handling
- Environment-based API URL configuration
- Comprehensive error categorization

**Error Handling Strategy:**
1. **Network Errors**: Connection failures, server unavailable
2. **HTTP Errors**: 4xx/5xx status codes with server error messages
3. **Parsing Errors**: Invalid JSON responses
4. **Timeout Errors**: Request timeouts

## Secure Download System Architecture

### Service Worker Implementation (`public/download-worker.js`)

**Step-by-Step Download Process:**

**Phase 1: Security Validation**
```javascript
class SecureImageDownloader {
  async downloadImages(images, requestId) {
    // 1. Input validation
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error('Invalid images array');
    }
    
    // 2. Limit enforcement
    if (images.length > 100) {
      throw new Error('Too many images requested (max 100)');
    }
    
    // 3. Initialize security tracking
    this.totalDownloaded = 0;
    this.abortController = new AbortController();
  }
}
```

**Phase 2: Concurrent Download Processing**
```javascript
async processBatch(images, requestId) {
  const semaphore = new Semaphore(3); // Max 3 concurrent downloads
  
  const downloadPromises = images.map(async (image, index) => {
    return semaphore.acquire(async () => {
      try {
        const result = await this.downloadSingleImage(image, index, requestId);
        this.sendProgress(requestId, ++completed, total, `Downloaded ${completed}/${total}`);
        return result;
      } catch (error) {
        console.warn(`Failed to download image ${index}:`, error.message);
        // Continue with other downloads (error isolation)
      }
    });
  });
  
  return Promise.allSettled(downloadPromises);
}
```

**Phase 3: Individual Image Security Pipeline**
```javascript
async downloadSingleImage(image, index, requestId) {
  // 1. URL validation
  if (!this.isValidImageUrl(image.url)) {
    throw new Error(`Invalid image URL: ${image.url}`);
  }
  
  // 2. Size limit check
  if (this.totalDownloaded > MAX_TOTAL_SIZE) {
    throw new Error('Total download size limit exceeded');
  }
  
  // 3. Secure fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  const response = await fetch(image.url, {
    signal: controller.signal,
    mode: 'cors',
    credentials: 'omit'
  });
  
  // 4. Content validation
  const contentType = response.headers.get('content-type');
  if (!this.isValidMimeType(contentType)) {
    throw new Error(`Invalid content type: ${contentType}`);
  }
  
  // 5. Size validation and processing
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${arrayBuffer.byteLength} bytes`);
  }
  
  this.totalDownloaded += arrayBuffer.byteLength;
  
  return {
    filename: this.generateSafeFilename(image.url, index, contentType),
    data: arrayBuffer,
    originalUrl: image.url,
    sourceUrl: image.sourceUrl,
    alt: image.alt
  };
}
```

**Phase 4: ZIP Creation & Delivery**
```javascript
async createZipFile(downloadedImages) {
  const zip = new JSZip();
  
  // Add images to ZIP
  downloadedImages.forEach((image) => {
    zip.file(image.filename, image.data);
  });
  
  // Add metadata file
  const metadata = {
    downloadDate: new Date().toISOString(),
    totalImages: downloadedImages.length,
    images: downloadedImages.map(img => ({
      filename: img.filename,
      originalUrl: img.originalUrl,
      sourceUrl: img.sourceUrl,
      alt: img.alt
    }))
  };
  
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));
  
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}
```

**Security Enforcement Rules:**
- **File Size**: 50MB per image, 500MB total
- **MIME Types**: Whitelist of image formats only
- **Protocols**: HTTP/HTTPS only
- **Timeouts**: 30 seconds per image
- **Concurrency**: Maximum 3 simultaneous downloads
- **Isolation**: Service worker context separation

## Canvas-Based Collage Generation System

### Collage Service Implementation (`src/utils/collageService.ts`)

**Step-by-Step Collage Creation Process:**

**Phase 1: Canvas Initialization**
```javascript
class CollageService {
  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;
  }
  
  async generateCollage(selectedImages, options = {
    width: 1200,
    height: 800,
    layout: 'grid',
    backgroundColor: '#ffffff',
    padding: 10
  }) {
    // 1. Validation
    if (selectedImages.length === 0) {
      return { success: false, error: 'No images selected' };
    }
    
    // 2. Canvas setup
    this.canvas.width = options.width;
    this.canvas.height = options.height;
    this.ctx.fillStyle = options.backgroundColor;
    this.ctx.fillRect(0, 0, options.width, options.height);
  }
}
```

**Phase 2: Image Loading Pipeline**
```javascript
private async loadImages(imageData: ImageData[]): Promise<HTMLImageElement[]> {
  const loadPromises = imageData.map((data) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${data.url}`));
      img.src = data.url;
    });
  });
  
  return Promise.all(loadPromises);
}
```

**Phase 3: Dynamic Layout Calculation**
```javascript
private calculateLayout(imageCount: number, options: CollageOptions) {
  const { width, height, padding } = options;
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;

  switch (imageCount) {
    case 1:
      return [{ x: padding, y: padding, width: availableWidth, height: availableHeight }];
      
    case 2:
      const halfWidth = (availableWidth - padding) / 2;
      return [
        { x: padding, y: padding, width: halfWidth, height: availableHeight },
        { x: padding + halfWidth + padding, y: padding, width: halfWidth, height: availableHeight }
      ];
      
    case 3:
      const thirdWidth = (availableWidth - padding * 2) / 3;
      return [
        { x: padding, y: padding, width: thirdWidth, height: availableHeight },
        { x: padding + thirdWidth + padding, y: padding, width: thirdWidth, height: availableHeight },
        { x: padding + (thirdWidth + padding) * 2, y: padding, width: thirdWidth, height: availableHeight }
      ];
      
    case 4:
      const quarterWidth = (availableWidth - padding) / 2;
      const quarterHeight = (availableHeight - padding) / 2;
      return [
        { x: padding, y: padding, width: quarterWidth, height: quarterHeight },
        { x: padding + quarterWidth + padding, y: padding, width: quarterWidth, height: quarterHeight },
        { x: padding, y: padding + quarterHeight + padding, width: quarterWidth, height: quarterHeight },
        { x: padding + quarterWidth + padding, y: padding + quarterHeight + padding, width: quarterWidth, height: quarterHeight }
      ];
      
    case 5:
      // Complex layout: 2 top images + 3 bottom images
      const topWidth = (availableWidth - padding) / 2;
      const topHeight = (availableHeight - padding) / 2;
      const bottomWidth = (availableWidth - padding * 2) / 3;
      const bottomHeight = availableHeight - topHeight - padding;
      return [
        { x: padding, y: padding, width: topWidth, height: topHeight },
        { x: padding + topWidth + padding, y: padding, width: topWidth, height: topHeight },
        { x: padding, y: padding + topHeight + padding, width: bottomWidth, height: bottomHeight },
        { x: padding + bottomWidth + padding, y: padding + topHeight + padding, width: bottomWidth, height: bottomHeight },
        { x: padding + (bottomWidth + padding) * 2, y: padding + topHeight + padding, width: bottomWidth, height: bottomHeight }
      ];
  }
}
```

**Phase 4: Aspect-Ratio Preserving Rendering**
```javascript
private async drawImages(images: HTMLImageElement[], layout: LayoutPosition[], options: CollageOptions) {
  for (let i = 0; i < images.length && i < layout.length; i++) {
    const img = images[i];
    const pos = layout[i];

    // Calculate aspect ratio fitting
    const imgAspect = img.width / img.height;
    const boxAspect = pos.width / pos.height;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgAspect > boxAspect) {
      // Image is wider than box - fit to width
      drawWidth = pos.width;
      drawHeight = pos.width / imgAspect;
      drawX = pos.x;
      drawY = pos.y + (pos.height - drawHeight) / 2;
    } else {
      // Image is taller than box - fit to height
      drawWidth = pos.height * imgAspect;
      drawHeight = pos.height;
      drawX = pos.x + (pos.width - drawWidth) / 2;
      drawY = pos.y;
    }

    // Draw with rounded corners
    this.drawRoundedImage(img, drawX, drawY, drawWidth, drawHeight, 8);
  }
}

private drawRoundedImage(img: HTMLImageElement, x: number, y: number, width: number, height: number, radius: number) {
  this.ctx.save();
  this.ctx.beginPath();
  this.ctx.roundRect(x, y, width, height, radius);
  this.ctx.clip();
  this.ctx.drawImage(img, x, y, width, height);
  this.ctx.restore();
}
```

**Phase 5: Export & Download**
```javascript
// Convert canvas to blob and create download
return new Promise((resolve) => {
  this.canvas.toBlob((blob) => {
    if (blob) {
      const imageUrl = URL.createObjectURL(blob);
      resolve({ 
        success: true, 
        imageBlob: blob,
        imageUrl: imageUrl
      });
    } else {
      resolve({ success: false, error: 'Failed to generate collage image' });
    }
  }, 'image/png', 0.9);
});
```

**Layout Patterns by Image Count:**
- **1 Image**: Full canvas utilization
- **2 Images**: Horizontal split (50/50)
- **3 Images**: Horizontal thirds (33/33/33)
- **4 Images**: 2x2 grid layout
- **5 Images**: 2 top (50/50) + 3 bottom (33/33/33)

**Canvas Rendering Pipeline:**
- Background fill with configurable color
- Image aspect ratio preservation
- Rounded corner clipping (8px radius)
- Centered positioning within layout bounds
- Padding management between images

### Print Integration System (`src/components/CollagePreviewDialog.tsx` + `src/utils/printService.ts`)

**Step-by-Step Print Order Process:**

**Phase 1: Collage Preview & Options**
```javascript
// CollagePreviewDialog.tsx
const CollagePreviewDialog = ({ imageBlob, imageUrl }) => {
  const [printOptions, setPrintOptions] = useState({
    size: 'medium',      // small (12"×18"), medium (18"×24"), large (24"×36")
    paperType: 'matte',  // matte or glossy
    quantity: 1
  });
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: { /* shipping details */ }
  });
};
```

**Phase 2: Printful API Integration**
```javascript
// printService.ts
class PrintService {
  async createPrintOrder(imageBlob, options, customerInfo) {
    // 1. Upload image to Printful
    const imageUrl = await this.uploadImage(imageBlob);
    
    // 2. Create order payload
    const orderData = {
      recipient: customerInfo.address,
      items: [{
        sync_variant_id: POSTER_PRODUCTS[options.size],
        quantity: options.quantity,
        files: [{ type: 'default', url: imageUrl }]
      }]
    };
    
    // 3. Submit order to Printful API
    const response = await fetch(`${PRINTFUL_API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    return {
      success: true,
      orderId: result.result.id,
      orderUrl: `https://www.printful.com/dashboard/orders/${result.result.id}`,
      estimatedCost: result.result.costs.total
    };
  }
}
```

**Phase 3: Order Management Flow**
1. **Preview**: User sees collage with print options
2. **Configuration**: Size, paper type, quantity selection
3. **Customer Info**: Shipping address collection
4. **Order Submission**: Printful API integration
5. **Confirmation**: Order ID and tracking information

### Service Communication Architecture

**Download Service (`src/utils/downloadService.ts`)**
```javascript
class DownloadService {
  // Main Thread ←→ Service Worker Communication
  async downloadImages(images, onProgress) {
    return new Promise((resolve, reject) => {
      // 1. Generate unique request ID
      this.currentRequestId = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 2. Setup progress callback
      this.progressCallback = onProgress;
      
      // 3. Send message to service worker
      this.worker.postMessage({
        type: 'DOWNLOAD_IMAGES',
        requestId: this.currentRequestId,
        data: { images }
      });
      
      // 4. Handle completion/error via message handlers
      this.handleDownloadComplete = (data) => {
        this.triggerDownload(data.zipBlob);
        resolve({ success: true, ...data });
      };
    });
  }
  
  private triggerDownload(zipBlob) {
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `images_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
```

**Communication Flow:**
```
UI Component → DownloadService → Service Worker
     ↓               ↓               ↓
Button Click → postMessage → downloadImages()
     ↓               ↓               ↓
Progress UI ← onProgress ← DOWNLOAD_PROGRESS
     ↓               ↓               ↓
Success UI  ← Promise  ← DOWNLOAD_COMPLETE
```

### Security Configuration (`src/utils/securityConfig.ts`)

**Centralized Security:**
- **SECURITY_CONFIG**: All security constants and limits
- **SecurityValidator**: Input validation utility functions
- **SecurityAudit**: Logging and monitoring for security events

**Validation Pipeline:**
1. URL protocol and format validation
2. MIME type whitelist checking
3. File size and count limit enforcement
4. Filename sanitization
5. Total download size tracking

## Type System (`src/types.ts`)

**Core Interfaces:**
```typescript
ImageData: {
  url: string;        // Absolute image URL
  sourceUrl: string;  // Page where image was found
  alt?: string;       // Alt text from img tag
}

CrawlResult: {
  images: ImageData[];
  error?: string;     // Error message if crawl failed
}

DownloadProgress: {
  current: number;    // Current download count
  total: number;      // Total images to download
  percentage: number; // Completion percentage
  message: string;    // Status message for UI
}

DownloadResult: {
  success: boolean;
  zipBlob?: Blob;     // Generated ZIP file
  downloadedCount?: number;
  totalCount?: number;
  error?: string;
}

CollageOptions: {
  width: number;      // Canvas width in pixels
  height: number;     // Canvas height in pixels
  layout: 'grid' | 'mosaic';  // Layout algorithm type
  backgroundColor: string;     // Background color (hex)
  padding: number;    // Padding between images
}

CollageResult: {
  success: boolean;
  imageBlob?: Blob;   // Generated collage PNG
  error?: string;     // Error message if generation failed
}

RobotsTxt: {
  isAllowed: (userAgent: string, path: string) => boolean;
}
```

## Core Algorithms & Business Rules

### URL Processing Pipeline
```javascript
// 1. URL Normalization Algorithm
const normalizeUrl = (input) => {
  // Add protocol if missing
  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    input = `https://${input}`;
  }
  
  // Construct URL object for validation
  try {
    const url = new URL(input);
    return url.href;
  } catch (error) {
    throw new Error('Invalid URL format');
  }
};

// 2. Absolute URL Resolution
const resolveUrl = (relativePath, basePage) => {
  try {
    return new URL(relativePath, basePage).href;
  } catch {
    return null; // Skip invalid URLs
  }
};

// 3. Same-Domain Validation
const isSameDomain = (url, baseDomain) => {
  try {
    return new URL(url).hostname === baseDomain;
  } catch {
    return false;
  }
};
```

### Crawling Control Algorithms
```javascript
// Termination Conditions
shouldStop() {
  const timeElapsed = Date.now() - this.startTime;
  const imageCount = this.foundImages.size;
  const pageCount = this.visitedUrls.size;
  
  return (
    imageCount >= 50 ||           // Image limit reached
    timeElapsed >= 180000 ||      // 3 minute timeout
    pageCount >= 20               // Page limit (implicit)
  );
}

// Image Filtering Rules
shouldSkipImage(url, element) {
  // Skip data URLs and invalid protocols
  if (url.startsWith('data:') || url.startsWith('javascript:')) return true;
  
  // Skip tiny images (likely tracking pixels)
  const width = parseInt($(element).attr('width')) || 0;
  const height = parseInt($(element).attr('height')) || 0;
  if (width > 0 && height > 0 && (width < 50 || height < 50)) return true;
  
  // Skip tracking/analytics images
  if (url.includes('tracking') || url.includes('analytics') || url.includes('beacon')) return true;
  
  // Skip duplicates
  if (this.foundImages.has(url)) return true;
  
  return false;
}
```

### Image Validation Pipeline
1. **Source Extraction**: Get src attribute from img tags
2. **URL Resolution**: Convert relative to absolute URLs
3. **Duplicate Check**: Skip if URL already processed
4. **Size Filtering**: Skip images smaller than 50x50 pixels
5. **Content Filtering**: Skip tracking pixels and analytics images
6. **Alt Text Extraction**: Capture accessibility information

### Download Security Algorithm
```javascript
downloadSingleImage(image) {
  // 1. URL validation
  if (!isValidImageUrl(image.url)) throw error;
  
  // 2. Size limit check
  if (totalDownloaded > MAX_TOTAL_SIZE) throw error;
  
  // 3. Fetch with timeout
  const response = await fetch(url, { 
    signal: abortController.signal,
    timeout: 30000 
  });
  
  // 4. MIME type validation
  if (!isValidMimeType(contentType)) throw error;
  
  // 5. File size validation
  if (fileSize > MAX_FILE_SIZE) throw error;
  
  // 6. Safe filename generation
  const filename = generateSafeFilename(url, index, contentType);
  
  return { filename, data, metadata };
}
```

### Concurrency Control Implementation
```javascript
// Semaphore Pattern for Download Throttling
class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;  // 3 for downloads
    this.currentConcurrency = 0;
    this.queue = [];
  }
  
  async acquire(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.tryNext();
    });
  }
  
  tryNext() {
    if (this.currentConcurrency >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    this.currentConcurrency++;
    const { task, resolve, reject } = this.queue.shift();

    task()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.currentConcurrency--;
        this.tryNext(); // Process next queued task
      });
  }
}

// Usage in download processing
const semaphore = new Semaphore(3);
const downloadPromises = images.map(async (image, index) => {
  return semaphore.acquire(async () => {
    return await this.downloadSingleImage(image, index, requestId);
  });
});
```

### Security Validation Algorithms
```javascript
// Multi-layer Security Pipeline
class SecurityValidator {
  static validateDownloadRequest(images) {
    // 1. Input structure validation
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error('Invalid images array');
    }
    
    // 2. Count limits
    if (images.length > 100) {
      throw new Error('Too many images requested (max 100)');
    }
    
    // 3. URL validation for each image
    const validImages = images.filter(img => {
      try {
        const url = new URL(img.url);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    });
    
    if (validImages.length === 0) {
      throw new Error('No valid image URLs found');
    }
    
    return validImages;
  }
  
  static validateImageContent(response, url) {
    // 1. Content-Type validation
    const contentType = response.headers.get('content-type');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
    
    // 2. File size validation
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
      throw new Error(`File too large: ${contentLength} bytes`);
    }
    
    return true;
  }
}
```

### Collage Layout Algorithm
```javascript
calculateLayout(imageCount, options) {
  const { width, height, padding } = options;
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;

  switch (imageCount) {
    case 1: return [fullCanvas];
    case 2: return [leftHalf, rightHalf];
    case 3: return [leftThird, centerThird, rightThird];
    case 4: return [topLeft, topRight, bottomLeft, bottomRight];
    case 5: return [topLeft, topRight, bottomLeft, bottomCenter, bottomRight];
  }
}
```

### Canvas Rendering Algorithm
```javascript
drawRoundedImage(img, x, y, width, height, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);  // Create rounded rectangle path
  ctx.clip();                                  // Set clipping region
  ctx.drawImage(img, x, y, width, height);    // Draw image within clip
  ctx.restore();                              // Restore context state
}
```

### Responsive Design Strategy
- **Mobile-First**: Base styles for mobile, progressive enhancement
- **Breakpoint System**: Material-UI's standard breakpoints (xs, sm, md, lg, xl)
- **Adaptive Layouts**: Different component arrangements per screen size
- **Touch Optimization**: Larger touch targets on mobile devices

## Performance Optimizations

### Frontend
- **Lazy Loading**: Images loaded on-demand in carousel
- **Error Boundaries**: Graceful handling of image load failures
- **Memoization**: React component optimization opportunities
- **Bundle Splitting**: Vite's automatic code splitting
- **Service Worker**: Background processing doesn't block UI

### Backend
- **Concurrent Requests**: Axios with connection pooling
- **Request Timeouts**: 10-second timeout per HTTP request
- **Memory Management**: Set-based duplicate detection
- **Early Termination**: Stop conditions prevent resource exhaustion

### Download Performance
- **Concurrent Downloads**: Semaphore-controlled (max 3 simultaneous)
- **Streaming**: Large files processed without full memory load
- **Compression**: ZIP files use DEFLATE compression (level 6)
- **Progress Batching**: UI updates batched to prevent excessive re-renders
- **Automatic Cleanup**: Blob URLs and resources cleaned up immediately

### Collage Performance
- **Canvas Optimization**: Hardware-accelerated 2D rendering
- **Image Caching**: Loaded images reused across operations
- **Memory Management**: Canvas cleared and reused for multiple generations
- **Aspect Ratio Preservation**: Efficient scaling calculations
- **Blob Generation**: Optimized PNG export with 0.9 quality

### Caching Strategy
- **URL Deduplication**: Set-based visited URL tracking
- **Image Deduplication**: Set-based found image URL tracking
- **No Persistent Cache**: Fresh crawl on each request
- **Worker Reuse**: Single service worker instance for all downloads

## Security Considerations

### Web Scraping Ethics
- **Robots.txt Compliance**: Check and respect robots.txt directives
- **Rate Limiting**: Built-in delays through timeout and limits
- **User Agent**: Proper identification as "ImageCrawlerBot/1.0"
- **Nofollow Respect**: Honor rel="nofollow" attributes

### Frontend Security
- **URL Validation**: Prevent malicious URL injection
- **External Links**: Open with noopener,noreferrer attributes
- **XSS Prevention**: Material-UI's built-in sanitization
- **CORS Configuration**: Proper cross-origin request handling

### Download Security Architecture

**Multi-Layer Protection:**
1. **Input Validation**: URL format, protocol, array structure
2. **Resource Limits**: File size (50MB), total size (500MB), count (100)
3. **Content Validation**: MIME type whitelist, header verification
4. **Request Security**: CORS mode, no credentials, timeout protection
5. **Isolation**: Service worker execution context separation

**Security Boundaries:**
```
Main Thread (UI) ←→ Service Worker (Downloads)
     ↑                      ↑
Restricted Access    Full Network Access
User Interaction     Background Processing
DOM Manipulation     File System Access
```

**Threat Mitigation:**
- **Large File Attacks**: Size limits and streaming
- **Malicious Content**: MIME type validation
- **Memory Exhaustion**: Concurrent limits and cleanup
- **Infinite Loops**: Timeout and count limits
- **Cross-Origin Attacks**: Isolated worker context

## Testing Strategy (`vite.config.ts`)

**Test Configuration:**
- **Environment**: jsdom for DOM simulation
- **Coverage Thresholds**: 70% minimum across all metrics
- **Excluded Paths**: node_modules, build artifacts, test files
- **Reporters**: Text, JSON, and HTML coverage reports

**Coverage Targets:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Development Workflow

### Concurrent Development
```bash
npm run dev  # Runs both frontend and backend simultaneously
```

### Server Management
- **Development**: Auto-restart with nodemon
- **Production**: Direct Node.js execution
- **Health Monitoring**: /health endpoint for status checks

### Build Process
- **Frontend**: Vite build system with TypeScript compilation
- **Backend**: No build step required (Node.js runtime)
- **Service Worker**: Served as static asset from public directory
- **Testing**: Vitest with coverage reporting

## Complete Data Flow Patterns

### End-to-End Application Flow
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  URL Validation  │───▶│  API Request    │
│  (URL Entry)    │    │  & Normalization │    │  to Backend     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Image Display   │◀───│  Response Parse  │◀───│ Backend Crawl   │
│ (Carousel/Grid) │    │  & State Update  │    │ & Extraction    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ├─── Download Path ────┐
         │                     │
         │              ┌─────────────────┐    ┌──────────────────┐
         │              │ Service Worker  │───▶│   ZIP Creation   │
         │              │ Batch Download  │    │  & File Delivery │
         │              └─────────────────┘    └──────────────────┘
         │
         └─── Collage Path ─────┐
                               │
                        ┌─────────────────┐    ┌──────────────────┐
                        │ Canvas Service  │───▶│ Print Integration│
                        │ Image Composite │    │ & Order System   │
                        └─────────────────┘    └──────────────────┘
```

### State Management Flow
```javascript
// Application State Transitions
App State Machine:
  INITIAL → (URL_SUBMIT) → LOADING → (CRAWL_SUCCESS) → DISPLAYING
     ↑                                                      │
     └──────────────── (BACK_BUTTON) ←─────────────────────┘

// Component State Dependencies
ImageCarousel State Dependencies:
  images[] (from parent) → validImages[] (filtered) → displayImages[]
                                    │
                                    ├─── downloadState (download system)
                                    └─── collageState (collage system)

// Service Worker State Synchronization
Main Thread State ←─── Message Passing ───→ Worker State
     │                                           │
downloadProgress ←── DOWNLOAD_PROGRESS ──── currentProgress
downloadComplete ←── DOWNLOAD_COMPLETE ──── zipGeneration
downloadError    ←── DOWNLOAD_ERROR    ──── errorState
```

### Collage Generation Flow
```
ImageCarousel → Toggle Selection Mode → Multi-select Images (max 5)
     ↓                    ↓                      ↓
Selection UI → Image Selection → Generate Collage Button
     ↓                    ↓                      ↓
CollageService → Canvas Setup → Image Loading → Layout Calculation
     ↓                    ↓                      ↓
Canvas Rendering → PNG Export → Automatic Download → Success Feedback
```

### Service Worker Communication
```
ImageCarousel → DownloadService → Service Worker
     ↓               ↓               ↓
Button Click → postMessage → downloadImages()
     ↓               ↓               ↓
Progress UI ← onProgress ← DOWNLOAD_PROGRESS
     ↓               ↓               ↓
Success UI  ← Promise  ← DOWNLOAD_COMPLETE
```

### Error Handling & Recovery Patterns
```javascript
// Error Propagation Chain
Service Worker Error → DownloadService → ImageCarousel → Snackbar
Network Error → Fetch Failure → Error Message → User Notification
Validation Error → Early Rejection → Error State → UI Feedback

// Error Recovery Strategies
class ErrorRecovery {
  // 1. Image Loading Errors
  handleImageError(imageUrl) {
    setImageErrors(prev => new Set(prev).add(imageUrl));
    // Removes failed images from display, continues with valid ones
  }
  
  // 2. Download Errors (Individual Image Failures)
  handleDownloadImageError(error, imageIndex) {
    console.warn(`Failed to download image ${imageIndex}:`, error.message);
    // Continue with other downloads (error isolation)
    return null; // Skip this image, don't fail entire batch
  }
  
  // 3. Service Worker Errors
  handleWorkerError(error) {
    console.error('Worker error:', error);
    this.cleanup(); // Graceful degradation
    throw new Error('Download service unavailable');
  }
  
  // 4. Network Timeout Recovery
  handleTimeout(operation) {
    return Promise.race([
      operation,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), 30000)
      )
    ]);
  }
}

// Graceful Degradation Examples
const fallbackStrategies = {
  // Service Worker not supported
  downloadFallback: () => {
    // Show individual download links instead of bulk download
    images.forEach(img => createDownloadLink(img.url));
  },
  
  // Canvas not supported
  collageFallback: () => {
    // Show message about browser compatibility
    showError('Collage feature requires modern browser with Canvas support');
  },
  
  // Network failures
  networkFallback: (error) => {
    // Provide retry mechanism with exponential backoff
    setTimeout(() => retryOperation(), Math.min(1000 * Math.pow(2, retryCount), 10000));
  }
};
```

### Performance Optimization Strategies
```javascript
// Memory Management Patterns
class MemoryManager {
  // 1. Blob URL Cleanup
  cleanupBlobUrls() {
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls.clear();
  }
  
  // 2. Canvas Context Reuse
  reuseCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Reuse same canvas for multiple collages
  }
  
  // 3. Image Reference Management
  cleanupImageReferences() {
    this.loadedImages.forEach(img => {
      img.onload = null;
      img.onerror = null;
      img.src = '';
    });
    this.loadedImages.clear();
  }
}

// Lazy Loading Implementation
const LazyImageLoader = {
  observeImages() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src; // Load actual image
          observer.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }
};

// Progress Batching for UI Updates
class ProgressBatcher {
  constructor(updateCallback, batchInterval = 100) {
    this.updateCallback = updateCallback;
    this.batchInterval = batchInterval;
    this.pendingUpdate = null;
    this.lastUpdate = 0;
  }
  
  reportProgress(progress) {
    const now = Date.now();
    if (now - this.lastUpdate >= this.batchInterval) {
      this.updateCallback(progress);
      this.lastUpdate = now;
    } else if (!this.pendingUpdate) {
      this.pendingUpdate = setTimeout(() => {
        this.updateCallback(progress);
        this.lastUpdate = Date.now();
        this.pendingUpdate = null;
      }, this.batchInterval);
    }
  }
}
```

## Component Lifecycle Management

### Download State Management
- **Initialization**: Service worker registration and setup
- **Active Download**: Progress tracking and cancellation support  
- **Completion**: Resource cleanup and success notification
- **Error Handling**: Graceful degradation and user feedback
- **Cleanup**: Component unmount cleanup and worker termination

### Collage State Management
- **Selection Mode**: Toggle between normal and multi-select modes
- **Image Selection**: Track selected images with Set data structure
- **Generation Process**: Canvas creation, image loading, and rendering
- **Export Process**: PNG blob generation and automatic download
- **State Reset**: Clear selections and return to normal mode

## Advanced Implementation Details

### Error Boundary Patterns
```javascript
// Image loading with fallback
<CardMedia
  onError={() => handleImageError(image.url)}
  // Removes failed images from display
/>

// Service worker error isolation
worker.onerror = (error) => {
  console.error('Worker error:', error);
  this.cleanup(); // Graceful degradation
};
```

### Memory Management Strategies
- **Set-based Deduplication**: Prevents duplicate processing
- **Blob URL Cleanup**: Automatic cleanup with setTimeout
- **Canvas Context Reuse**: Single canvas instance for all collages
- **Image Reference Management**: Proper cleanup of loaded images
- **Worker Termination**: Clean shutdown on component unmount

### Cross-Origin Resource Handling
```javascript
// Image loading with CORS
img.crossOrigin = 'anonymous';

// Service worker fetch with CORS
fetch(url, {
  mode: 'cors',
  credentials: 'omit'  // No credentials for security
});
```

### Progressive Enhancement Patterns
- **Feature Detection**: Check for service worker support
- **Graceful Degradation**: Fallback UI states for unsupported features
- **Responsive Design**: Mobile-first with progressive enhancement
- **Accessibility**: Proper ARIA labels and keyboard navigation