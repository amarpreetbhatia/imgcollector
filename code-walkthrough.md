# CollageForge - Technical Code Walkthrough

## 🏗️ Architecture Overview

CollageForge is a modern full-stack React application that transforms website image discovery into a complete merchandise platform. This walkthrough provides developers with a comprehensive understanding of the codebase structure, data flow patterns, and key implementation details.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Material-UI + Vite
- **Backend**: Node.js + Express + Cheerio + Axios
- **Canvas Processing**: HTML5 Canvas API + Image manipulation
- **Service Architecture**: Clean Architecture with SOLID principles
- **Security**: Multi-layer validation + Service Worker isolation

## 📁 Project Structure & Component Hierarchy

```
src/
├── components/                 # React UI Components
│   ├── ImageCarousel.tsx      # Main image display with multi-mode interactions
│   ├── WelcomeScreen.tsx      # URL input and crawl initiation
│   ├── CollagePreviewDialog.tsx # Collage preview with merchandise integration
│   ├── MerchandiseSelector.tsx  # Complete product catalog interface
│   └── MerchandiseShowcase.tsx  # Product showcase for welcome screen
├── services/                   # Clean Architecture Service Layer
│   ├── interfaces/            # Service contracts (Dependency Inversion)
│   ├── implementations/       # Concrete service implementations
│   ├── ServiceFactory.ts      # Dependency injection container
│   └── ServiceInitializer.ts  # Service configuration
├── adapters/                   # Legacy compatibility layer
├── contracts/                  # API contracts (Frontend ↔ Backend)
├── utils/                      # Legacy utilities (backward compatibility)
├── types.ts                    # TypeScript interface definitions
└── App.tsx                     # Main application state controller
```

## 🔄 Data Flow Architecture

### Primary Data Flow Pattern
```
User Input → State Management → API Communication → Backend Processing → Response Handling → UI Updates
```

### Component Communication Pattern
```
App (Central State)
├── WelcomeScreen → triggers crawl → updates App state
└── ImageCarousel → receives images → manages local interactions
    ├── Download System → Service Worker → ZIP creation
    ├── Collage System → Canvas API → Blob generation
    └── Merchandise System → Printful API → Order processing
```

## 🎯 Core Business Logic & Algorithms

### Image Discovery Rules
- **Time Limit**: 180 seconds maximum crawl time
- **Image Limit**: 50 images maximum per session
- **Depth Limit**: 2 levels (main page + internal links)
- **Domain Restriction**: Same-domain only for security
- **Size Filtering**: Skip images < 50×50px (tracking pixels)
- **Content Filtering**: Skip analytics/tracking images

### Collage Generation Algorithm
- **Layout Engine**: Dynamic layouts based on image count (1-5)
- **Aspect Ratio Preservation**: Smart fitting with centered positioning
- **Canvas Optimization**: 1200×800px high-resolution output
- **Rendering Pipeline**: Background → Images → Text → Export

### Security Enforcement
- **Download Limits**: 50MB per image, 500MB total
- **MIME Validation**: Whitelist of approved formats
- **Concurrency Control**: Max 3 simultaneous downloads
- **Service Worker Isolation**: Security boundary separation

## 🧩 Component Deep Dive

### 1. Application Bootstrap (`src/index.tsx` → `src/App.tsx`)

**Entry Point Pattern:**
```typescript
// index.tsx - React 18 initialization
const root = createRoot(document.getElementById('root')!);
root.render(<App />);

// App.tsx - Central state management
const [images, setImages] = useState<ImageData[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [showCarousel, setShowCarousel] = useState(false);
```

**State Transition Logic:**
```
Welcome Screen → Loading State → Results Display → Back to Welcome
```

### 2. URL Input & Crawl System (`src/components/WelcomeScreen.tsx`)

**URL Validation Algorithm:**
```typescript
const validateUrl = (inputUrl: string): boolean => {
  try {
    const normalizedUrl = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`;
    new URL(normalizedUrl);
    return true;
  } catch {
    return false;
  }
};
```

**Progress Simulation Pattern:**
```typescript
// Simulated progress: 0-90% during crawl, 100% on completion
const progressInterval = setInterval(() => {
  setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
}, 500);
```

**API Communication Flow:**
```typescript
const result = await imageCrawler.crawl(url.trim());
if (result.error) {
  setError(result.error);
} else {
  onCrawlComplete(result.images);
}
```

### 3. Image Display Hub (`src/components/ImageCarousel.tsx`)

**Multi-State Management Pattern:**
```typescript
// Display states
const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('carousel');
const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

// Download integration
const [isDownloading, setIsDownloading] = useState(false);
const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);

// Collage integration
const [selectionMode, setSelectionMode] = useState(false);
const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
```

**Interaction Handling Logic:**
```typescript
const handleImageClick = (image: ImageData) => {
  if (selectionMode) {
    toggleImageSelection(image.url);  // Multi-select mode
  } else {
    setSelectedImage(image);          // Preview mode
  }
};
```

**Responsive Carousel Configuration:**
```typescript
const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 1400 }, items: 5 },
  desktop: { breakpoint: { max: 1400, min: 1024 }, items: 4 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1 }
};
```

## 🖥️ Backend Crawling Engine (`server/server.js`)

### Crawling Algorithm Implementation

**Phase 1: Initialization & Validation**
```javascript
class ImageCrawler {
  async crawlImages(startUrl) {
    this.visitedUrls = new Set();
    this.foundImages = new Set();
    this.startTime = Date.now();
    
    const url = new URL(startUrl);
    this.domain = url.hostname;
    
    await this.checkRobotsTxt(url);
  }
}
```

**Phase 2: Recursive Page Processing**
```javascript
async crawlPage(url, depth = 0) {
  if (this.shouldStop() || depth > 1) return;
  
  const response = await axios.get(url, { timeout: 10000 });
  const $ = cheerio.load(response.data);
  
  await this.extractImages($, url);
  
  if (depth === 0) {
    await this.followLinks($, url, depth + 1);
  }
}
```

**Phase 3: Image Extraction & Filtering**
```javascript
async extractImages($, pageUrl) {
  $('img').each((index, element) => {
    const src = $(element).attr('src');
    const imageUrl = new URL(src, pageUrl).href;
    
    if (this.shouldSkipImage(imageUrl, element)) return;
    
    this.foundImages.add({
      url: imageUrl,
      sourceUrl: pageUrl,
      alt: $(element).attr('alt') || ''
    });
  });
}
```

**Termination Conditions:**
```javascript
shouldStop() {
  return (
    this.foundImages.size >= 50 ||                    // Image limit
    Date.now() - this.startTime > 180000 ||          // Time limit
    this.visitedUrls.size > 20                       // Page limit
  );
}
```

## 🎨 Canvas-Based Collage System (`src/utils/collageService.ts`)

### Collage Generation Pipeline

**Phase 1: Canvas Setup & Validation**
```typescript
class CollageService {
  async generateCollage(selectedImages: ImageData[], options: CollageOptions) {
    // Validation
    if (selectedImages.length === 0 || selectedImages.length > 5) {
      return { success: false, error: 'Invalid image count' };
    }
    
    // Canvas initialization
    this.canvas.width = options.width;
    this.canvas.height = options.height;
    this.ctx.fillStyle = options.backgroundColor;
    this.ctx.fillRect(0, 0, options.width, options.height);
  }
}
```

**Phase 2: Image Loading with CORS Handling**
```typescript
private async loadImages(imageData: ImageData[]): Promise<HTMLImageElement[]> {
  const loadPromises = imageData.map((data) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';  // Enable CORS
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load: ${data.url}`));
      img.src = data.url;
    });
  });
  
  return Promise.all(loadPromises);
}
```

**Phase 3: Dynamic Layout Calculation**
```typescript
private calculateLayout(imageCount: number, options: CollageOptions) {
  const { width, height, padding } = options;
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;

  switch (imageCount) {
    case 1: return [{ x: padding, y: padding, width: availableWidth, height: availableHeight }];
    case 2: return this.createTwoImageLayout(availableWidth, availableHeight, padding);
    case 3: return this.createThreeImageLayout(availableWidth, availableHeight, padding);
    case 4: return this.createFourImageLayout(availableWidth, availableHeight, padding);
    case 5: return this.createFiveImageLayout(availableWidth, availableHeight, padding);
  }
}
```

**Phase 4: Aspect-Ratio Preserving Rendering**
```typescript
private async drawImages(images: HTMLImageElement[], layout: LayoutPosition[]) {
  for (let i = 0; i < images.length && i < layout.length; i++) {
    const img = images[i];
    const pos = layout[i];

    // Calculate aspect ratio fitting
    const imgAspect = img.width / img.height;
    const boxAspect = pos.width / pos.height;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgAspect > boxAspect) {
      // Fit to width
      drawWidth = pos.width;
      drawHeight = pos.width / imgAspect;
      drawX = pos.x;
      drawY = pos.y + (pos.height - drawHeight) / 2;
    } else {
      // Fit to height
      drawWidth = pos.height * imgAspect;
      drawHeight = pos.height;
      drawX = pos.x + (pos.width - drawWidth) / 2;
      drawY = pos.y;
    }

    this.drawRoundedImage(img, drawX, drawY, drawWidth, drawHeight, 8);
  }
}
```

## 🔒 Security Architecture

### Service Worker Download System (`public/download-worker.js`)

**Security Validation Pipeline:**
```javascript
class SecureImageDownloader {
  async downloadSingleImage(image, index, requestId) {
    // 1. URL validation
    if (!this.isValidImageUrl(image.url)) {
      throw new Error(`Invalid image URL: ${image.url}`);
    }
    
    // 2. Size limit enforcement
    if (this.totalDownloaded > MAX_TOTAL_SIZE) {
      throw new Error('Total download size limit exceeded');
    }
    
    // 3. Secure fetch with timeout
    const response = await fetch(image.url, {
      signal: this.abortController.signal,
      mode: 'cors',
      credentials: 'omit'
    });
    
    // 4. Content type validation
    const contentType = response.headers.get('content-type');
    if (!this.isValidMimeType(contentType)) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
    
    // 5. File size validation
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${arrayBuffer.byteLength} bytes`);
    }
    
    return this.processValidatedImage(arrayBuffer, image, index);
  }
}
```

**Concurrency Control with Semaphore:**
```javascript
async processBatch(images, requestId) {
  const semaphore = new Semaphore(3); // Max 3 concurrent downloads
  
  const downloadPromises = images.map(async (image, index) => {
    return semaphore.acquire(async () => {
      try {
        return await this.downloadSingleImage(image, index, requestId);
      } catch (error) {
        console.warn(`Download failed for image ${index}:`, error.message);
        return null; // Continue with other downloads
      }
    });
  });
  
  return Promise.allSettled(downloadPromises);
}
```

## 🛍️ Merchandise System Architecture

### Product Catalog Management (`src/utils/printService.ts`)

**Product Category Structure:**
```typescript
const PRODUCT_CATALOG: { [key: string]: ProductCategory } = {
  poster: {
    id: 'poster',
    name: 'Posters',
    icon: '🖼️',
    variants: [
      { id: 1, name: 'Small Poster', size: '12"×18"', price: 15.95 },
      { id: 2, name: 'Medium Poster', size: '18"×24"', price: 19.95 },
      { id: 3, name: 'Large Poster', size: '24"×36"', price: 24.95 }
    ]
  },
  tshirt: {
    id: 'tshirt',
    name: 'T-Shirts',
    icon: '👕',
    placement: ['front', 'back', 'both'],
    variants: [/* size/color combinations */]
  }
  // ... 7 more product categories
};
```

**Printful API Integration Pattern:**
```typescript
class MerchandiseService {
  async createMerchandiseOrder(imageBlob: Blob, options: PrintOptions, customerInfo: any) {
    // 1. Upload image to Printful
    const imageUrl = await this.uploadImage(imageBlob);
    
    // 2. Prepare order data
    const orderData = {
      recipient: customerInfo.address,
      items: [{
        variant_id: this.findVariantByOptions(options).id,
        quantity: options.quantity,
        files: this.prepareProductFiles(imageUrl, options)
      }]
    };
    
    // 3. Submit to Printful API
    const response = await fetch(`${PRINTFUL_API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify(orderData)
    });
    
    return this.handleOrderResponse(response);
  }
}
```

## 🏛️ Clean Architecture Implementation

### Service Layer Pattern (`src/services/`)

**Dependency Inversion with Interfaces:**
```typescript
// Interface definition
interface ICrawlerService {
  crawlImages(request: CrawlRequest): Promise<ApiResponse<CrawlResponse>>;
  validateUrl(url: string): boolean;
  isAllowedByCrawlPolicy(url: string): Promise<boolean>;
}

// Implementation
class CrawlerService implements ICrawlerService {
  constructor(private httpClient: HttpClient, private config: CrawlerConfig) {}
  
  async crawlImages(request: CrawlRequest): Promise<ApiResponse<CrawlResponse>> {
    // Implementation details...
  }
}
```

**Service Factory for Dependency Injection:**
```typescript
export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, any> = new Map();

  public registerService<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  public getCrawlerService(): ICrawlerService {
    return this.getService<ICrawlerService>('crawler');
  }
}
```

**Service Initialization Pattern:**
```typescript
export class ServiceInitializer {
  public static initialize(environment: 'development' | 'production' = 'development'): void {
    const config = this.createConfig(environment);
    const httpClient = new HttpClient();
    const serviceFactory = ServiceFactory.getInstance();
    
    serviceFactory.registerService('crawler', createCrawlerService(httpClient));
    serviceFactory.registerService('collage', createCollageService());
  }
}
```

## 📊 Type System & Data Contracts (`src/types.ts` + `src/contracts/api.ts`)

### Core Data Interfaces
```typescript
// Frontend types (legacy compatibility)
export interface ImageData {
  url: string;        // Absolute image URL
  sourceUrl: string;  // Page where image was found
  alt?: string;       // Alt text from img tag
}

// API contracts (new architecture)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface CrawlRequest {
  url: string;
  maxImages?: number;
  timeout?: number;
}

export interface CrawlResponse {
  images: ImageMetadata[];
  sourceUrl: string;
  crawledAt: string;
  totalFound: number;
}
```

### State Management Patterns
```typescript
// Component state pattern
const [images, setImages] = useState<ImageData[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string>('');

// Complex state with multiple concerns
const [downloadState, setDownloadState] = useState<{
  isDownloading: boolean;
  progress: DownloadProgress | null;
  error: string | null;
}>({
  isDownloading: false,
  progress: null,
  error: null
});
```

## 🔄 Communication Patterns

### Frontend ↔ Backend API Communication
```typescript
// API client pattern
class ImageCrawler {
  async crawl(url: string): Promise<CrawlResult> {
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      const response = await fetch('http://localhost:3001/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl })
      });
      
      const data = await response.json();
      return { images: data.images || [] };
    } catch (error) {
      return { images: [], error: error.message };
    }
  }
}
```

### Service Worker Communication
```typescript
// Main thread → Service worker
this.worker.postMessage({
  type: 'DOWNLOAD_IMAGES',
  requestId: this.currentRequestId,
  data: { images }
});

// Service worker → Main thread
self.postMessage({
  type: 'DOWNLOAD_PROGRESS',
  requestId,
  data: { current, total, percentage, message }
});
```

## 🎯 Key Implementation Patterns

### Error Handling Strategy
```typescript
// Component-level error boundaries
try {
  const result = await operation();
  setSuccess(result);
} catch (error) {
  setError(error instanceof Error ? error.message : 'Unknown error');
} finally {
  setLoading(false);
}
```

### Responsive Design Pattern
```typescript
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

// Conditional rendering based on screen size
{isMobile ? (
  <MobileComponent />
) : (
  <DesktopComponent />
)}
```

### Performance Optimization
```typescript
// Lazy loading with React.lazy
const MerchandiseSelector = React.lazy(() => import('./MerchandiseSelector'));

// Memoization for expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(dependencies);
}, [dependencies]);

// Debounced input handling
const debouncedSearch = useCallback(
  debounce((query: string) => performSearch(query), 300),
  []
);
```

This technical walkthrough provides developers with the essential understanding needed to navigate, modify, and extend the CollageForge codebase effectively. Each section focuses on the practical implementation details and patterns used throughout the application.ing;
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
#
# Comprehensive Merchandise System

### MerchandiseService Architecture (`src/utils/printService.ts`)

**Complete Product Catalog Management:**
```typescript
// Real Printful product catalog with 9 categories
const PRODUCT_CATALOG: { [key: string]: ProductCategory } = {
  poster: {
    id: 'poster',
    name: 'Posters',
    description: 'High-quality prints perfect for wall art',
    icon: '🖼️',
    variants: [
      { id: 1, name: 'Small Poster', size: '12"×18"', price: 15.95 },
      { id: 2, name: 'Medium Poster', size: '18"×24"', price: 19.95 },
      { id: 3, name: 'Large Poster', size: '24"×36"', price: 24.95 },
    ]
  },
  tshirt: {
    id: 'tshirt',
    name: 'T-Shirts',
    description: 'Comfortable cotton tees with your custom design',
    icon: '👕',
    placement: ['front', 'back', 'both'],
    sizeGuide: 'https://www.printful.com/size-guide/unisex-jersey-short-sleeve-tee',
    variants: [
      { id: 71, name: 'Unisex T-Shirt', size: 'S', color: 'White', price: 12.95 },
      { id: 71, name: 'Unisex T-Shirt', size: 'M', color: 'White', price: 12.95 },
      // ... more variants for different sizes and colors
    ]
  },
  // ... 7 more product categories (hoodie, mug, canvas, phonecase, totebag, pillow, sticker)
};
```

**Step-by-Step Order Processing:**
```typescript
class MerchandiseService {
  async createMerchandiseOrder(imageBlob, options, customerInfo) {
    // Phase 1: Image Upload to Printful
    const imageUrl = await this.uploadImage(imageBlob);
    
    // Phase 2: Variant Selection & Validation
    const variant = this.findVariantByOptions(options);
    if (!variant) throw new Error('Product variant not found');
    
    // Phase 3: File Preparation (handles front/back placement for apparel)
    const files = this.prepareProductFiles(imageUrl, options);
    
    // Phase 4: Order Data Construction
    const orderData = {
      recipient: customerInfo.address,
      items: [{
        variant_id: variant.id,
        quantity: options.quantity,
        files: files
      }],
      retail_costs: {
        currency: 'USD',
        subtotal: (variant.price * options.quantity).toFixed(2),
        shipping: '0.00', // Calculated by Printful
        tax: '0.00'
      }
    };
    
    // Phase 5: API Submission
    const response = await fetch(`${PRINTFUL_API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    // Phase 6: Response Processing
    const result = await response.json();
    return {
      success: true,
      orderId: result.result.id,
      orderUrl: `https://www.printful.com/dashboard/orders/${result.result.id}`,
      estimatedCost: result.result.costs.total
    };
  }
}
```

**Advanced Features:**
- **Real-time Mockup Generation**: Live product previews using Printful API
- **Shipping Rate Calculation**: Dynamic shipping costs by location
- **Multi-file Support**: Handle front/back designs for apparel
- **Recommendation Engine**: Smart product suggestions based on current selection
- **Cost Calculator**: Real-time pricing with tax and shipping estimates

### MerchandiseSelector Component (`src/components/MerchandiseSelector.tsx`)

**Complete Product Configuration Interface:**
```typescript
const MerchandiseSelector: React.FC<MerchandiseSelectorProps> = ({
  imageBlob, imageUrl, onOrderCreate, onClose
}) => {
  // State Management
  const [selectedCategory, setSelectedCategory] = useState<string>('poster');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [placement, setPlacement] = useState<string>('front');
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  
  // Real-time mockup generation
  useEffect(() => {
    const generateMockup = async () => {
      if (!selectedVariant || !imageUrl) return;
      
      const mockupKey = await merchandiseService.getProductMockup(
        selectedVariant.id,
        imageUrl,
        placement
      );
      if (mockupKey) {
        setMockupUrl(`https://api.printful.com/mockup-generator/task?task_key=${mockupKey}`);
      }
    };
    
    generateMockup();
  }, [selectedVariant, imageUrl, placement]);
};
```

**UI Architecture:**
- **Product Categories Grid**: Visual selection of all 9 product types
- **Variant Configuration**: Dynamic size, color, and placement options
- **Live Mockup Preview**: Real-time product visualization
- **Pricing Calculator**: Instant cost calculation with shipping estimates
- **Recommendation System**: Smart product suggestions
- **Size Guide Integration**: Links to detailed sizing information

### CollagePreviewDialog Enhancement (`src/components/CollagePreviewDialog.tsx`)

**Tabbed Interface Architecture:**
```typescript
const CollagePreviewDialog: React.FC<CollagePreviewDialogProps> = ({
  open, onClose, imageBlob, imageUrl
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [showMerchandiseSelector, setShowMerchandiseSelector] = useState(false);
  
  // Tab 0: Preview & Download
  // Tab 1: Quick Poster Order
  // Full Merchandise Selector: Separate modal
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
        <Tab icon={<PaletteIcon />} label="Preview & Download" />
        <Tab icon={<PrintIcon />} label="Quick Poster Order" />
      </Tabs>
      
      {/* Tab Content */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Enhanced Image Preview */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2}>
              <img src={imageUrl} alt="Collage preview" />
            </Paper>
          </Grid>
          
          {/* Action Panel */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Download Options */}
              <Paper elevation={1}>
                <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
                  Download High-Res Image
                </Button>
              </Paper>
              
              {/* Merchandise Options */}
              <Paper elevation={1}>
                <Typography variant="h6">🛍️ Turn Into Merchandise</Typography>
                <Grid container spacing={1}>
                  {productCategories.slice(0, 6).map((category) => (
                    <Grid item xs={4} key={category.id}>
                      <Paper onClick={handleShowMerchandise}>
                        <Typography variant="h6">{category.icon}</Typography>
                        <Typography variant="caption">{category.name}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                <Button onClick={handleShowMerchandise} startIcon={<ShoppingCartIcon />}>
                  Explore All Products
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Dialog>
  );
};
```

**Enhanced Features:**
- **Tabbed Interface**: Separate tabs for preview, download, and ordering
- **Product Category Preview**: Visual grid of available merchandise
- **Quick Poster Order**: Streamlined poster ordering flow
- **Full Merchandise Access**: Complete product catalog integration
- **Download Integration**: High-resolution image download options

### Enhanced ImageCarousel (`src/components/ImageCarousel.tsx`)

**Advanced Selection System:**
```typescript
const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, onBack }) => {
  // Enhanced State Management
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);
  const [collagePreview, setCollagePreview] = useState<{
    blob: Blob | null;
    url: string | null;
  }>({ blob: null, url: null });
  const [showCollagePreview, setShowCollagePreview] = useState(false);
  
  // Selection Logic
  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageUrl)) {
        newSet.delete(imageUrl);
      } else if (newSet.size < 5) { // Maximum 5 images for collage
        newSet.add(imageUrl);
      }
      return newSet;
    });
  };
  
  // Collage Generation
  const handleGenerateCollage = async () => {
    if (selectedImages.size === 0) return;
    
    setIsGeneratingCollage(true);
    const selectedImageData = getSelectedImageData();
    const result = await collageService.generateCollage(selectedImageData);
    
    if (result.success && result.imageBlob && result.imageUrl) {
      setCollagePreview({
        blob: result.imageBlob,
        url: result.imageUrl,
      });
      setShowCollagePreview(true);
    }
    setIsGeneratingCollage(false);
  };
};
```

**UI Enhancements:**
- **Dual Mode Operation**: Browse mode vs. selection mode
- **Visual Selection Feedback**: Checkboxes and numbered badges
- **Smart Button States**: Context-aware action buttons
- **Progress Indicators**: Real-time feedback for all operations
- **Mobile Optimization**: Responsive design for all screen sizes

## Advanced Canvas Collage System (`src/utils/collageService.ts`)

### Smart Layout Engine

**Dynamic Layout Calculation:**
```typescript
class CollageService {
  private calculateLayout(imageCount: number, options: CollageOptions) {
    const { width, height, padding } = options;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    switch (imageCount) {
      case 1:
        // Full canvas utilization
        return [{ x: padding, y: padding, width: availableWidth, height: availableHeight }];
        
      case 2:
        // Horizontal split (50/50)
        const halfWidth = (availableWidth - padding) / 2;
        return [
          { x: padding, y: padding, width: halfWidth, height: availableHeight },
          { x: padding + halfWidth + padding, y: padding, width: halfWidth, height: availableHeight }
        ];
        
      case 3:
        // Horizontal thirds (33/33/33)
        const thirdWidth = (availableWidth - padding * 2) / 3;
        return [
          { x: padding, y: padding, width: thirdWidth, height: availableHeight },
          { x: padding + thirdWidth + padding, y: padding, width: thirdWidth, height: availableHeight },
          { x: padding + (thirdWidth + padding) * 2, y: padding, width: thirdWidth, height: availableHeight }
        ];
        
      case 4:
        // 2×2 grid layout
        const quarterWidth = (availableWidth - padding) / 2;
        const quarterHeight = (availableHeight - padding) / 2;
        return [
          { x: padding, y: padding, width: quarterWidth, height: quarterHeight },
          { x: padding + quarterWidth + padding, y: padding, width: quarterWidth, height: quarterHeight },
          { x: padding, y: padding + quarterHeight + padding, width: quarterWidth, height: quarterHeight },
          { x: padding + quarterWidth + padding, y: padding + quarterHeight + padding, width: quarterWidth, height: quarterHeight }
        ];
        
      case 5:
        // Complex layout: 2 top (50/50) + 3 bottom (33/33/33)
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
}
```

**Aspect-Ratio Preserving Rendering:**
```typescript
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

    // Draw with rounded corners for professional appearance
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

**Canvas Pipeline:**
1. **Initialization**: Create 1200×800px canvas with 2D context
2. **Background Fill**: Apply configurable background color
3. **Image Loading**: Load all selected images with CORS support
4. **Layout Calculation**: Dynamic positioning based on image count
5. **Aspect Preservation**: Smart fitting within layout bounds
6. **Rounded Rendering**: Professional appearance with 8px radius
7. **Export**: High-quality PNG blob generation

## Enhanced Type System (`src/types.ts`)

### Complete Interface Definitions

```typescript
// Core Image Data
interface ImageData {
  url: string;        // Absolute image URL
  sourceUrl: string;  // Page where image was found
  alt?: string;       // Alt text from img tag
}

// Crawling Results
interface CrawlResult {
  images: ImageData[];
  error?: string;     // Error message if crawl failed
}

// Download System Types
interface DownloadProgress {
  current: number;    // Current download count
  total: number;      // Total images to download
  percentage: number; // Completion percentage (0-100)
  message: string;    // Status message for UI display
}

interface DownloadResult {
  success: boolean;
  zipBlob?: Blob;     // Generated ZIP file
  downloadedCount?: number;
  totalCount?: number;
  error?: string;
}

// Collage System Types
interface CollageOptions {
  width: number;      // Canvas width in pixels (default: 1200)
  height: number;     // Canvas height in pixels (default: 800)
  layout: 'grid' | 'mosaic';  // Layout algorithm type
  backgroundColor: string;     // Background color (hex format)
  padding: number;    // Padding between images in pixels
}

interface CollageResult {
  success: boolean;
  imageBlob?: Blob;   // Generated collage PNG
  imageUrl?: string;  // Object URL for preview
  error?: string;     // Error message if generation failed
}

// Merchandise System Types
interface ProductCategory {
  id: string;         // Unique product identifier
  name: string;       // Display name (e.g., "T-Shirts")
  description: string; // Product description
  icon: string;       // Emoji icon for UI
  variants: ProductVariant[]; // Available product variants
  placement?: ('front' | 'back' | 'both')[]; // For apparel
  sizeGuide?: string; // URL to size guide
}

interface ProductVariant {
  id: number;         // Printful variant ID
  name: string;       // Variant display name
  size: string;       // Size specification
  color?: string;     // Color option (for apparel)
  price: number;      // Base price in USD
}

interface PrintOptions {
  productType: 'poster' | 'tshirt' | 'hoodie' | 'mug' | 'canvas' | 'phonecase' | 'totebag' | 'pillow' | 'sticker';
  size: string;       // Size specification
  color?: string;     // Color option (for apparel)
  material?: string;  // Material type (matte, glossy, cotton, etc.)
  quantity: number;   // Order quantity
  placement?: 'front' | 'back' | 'both'; // Design placement (for apparel)
}

interface PrintOrderResult {
  success: boolean;
  orderId?: string;   // Printful order ID
  orderUrl?: string;  // Order management URL
  estimatedCost?: number; // Total cost estimate
  error?: string;     // Error message if order failed
}

// Security Configuration
interface SecurityConfig {
  maxFileSize: number;        // Maximum file size per image (bytes)
  maxTotalSize: number;       // Maximum total download size (bytes)
  maxConcurrentDownloads: number; // Maximum simultaneous downloads
  allowedMimeTypes: string[]; // Whitelist of allowed MIME types
  downloadTimeout: number;    // Timeout per image download (ms)
  validProtocols: string[];   // Allowed URL protocols
}
```

## Data Flow Patterns

### State Management Architecture

**App-Level State Flow:**
```
App.tsx (Central State)
├── images: ImageData[]           # Crawled image collection
├── isLoading: boolean           # Crawl progress state
├── showCarousel: boolean        # View state toggle
└── error: string | null         # Error state management

WelcomeScreen → App → ImageCarousel
     ↓           ↓         ↓
URL Input → State Update → Image Display
     ↓           ↓         ↓
Crawl API → Loading State → Results View
```

**Component Communication Patterns:**
```
Parent → Child: Props-based data flow
Child → Parent: Callback functions
Service → Component: Promise-based async operations
Worker → Service: Message-based communication
```

### API Communication Flow

**Frontend ↔ Backend:**
```typescript
// Frontend Request (src/utils/crawler.ts)
const response = await fetch(`${API_BASE}/api/crawl`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: normalizedUrl })
});

// Backend Processing (server/server.js)
app.post('/api/crawl', async (req, res) => {
  try {
    const { url } = req.body;
    const crawler = new ImageCrawler();
    const result = await crawler.crawlImages(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Service Worker Communication:**
```typescript
// Main Thread → Service Worker
downloadService.worker.postMessage({
  type: 'DOWNLOAD_IMAGES',
  requestId: uniqueId,
  data: { images: selectedImages }
});

// Service Worker → Main Thread
self.postMessage({
  type: 'DOWNLOAD_PROGRESS',
  requestId: requestId,
  data: { current: 5, total: 10, percentage: 50, message: 'Downloaded 5/10 images' }
});
```

### Error Handling Patterns

**Hierarchical Error Management:**
```typescript
// Component Level
try {
  const result = await crawlerService.crawlImages(url);
  setImages(result.images);
} catch (error) {
  setError(error.message);
  // Graceful degradation
}

// Service Level
async crawlImages(url: string): Promise<CrawlResult> {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return { images: [], error: error.message };
  }
}

// Worker Level
self.addEventListener('error', (event) => {
  self.postMessage({
    type: 'DOWNLOAD_ERROR',
    requestId: currentRequestId,
    data: { error: event.error.message }
  });
});
```

## Performance Optimization Strategies

### Image Loading Optimization
- **Lazy Loading**: Images load as they enter viewport
- **Error Boundaries**: Failed images don't break the interface
- **Progressive Enhancement**: Graceful degradation for slow connections
- **Memory Management**: Proper cleanup of object URLs and canvas contexts

### Canvas Performance
- **Efficient Rendering**: Single-pass drawing with optimized operations
- **Memory Management**: Proper canvas cleanup and garbage collection
- **Async Processing**: Non-blocking image loading and processing
- **Quality Balance**: Optimal resolution vs. performance trade-offs

### Service Worker Efficiency
- **Concurrent Downloads**: Controlled parallelism (max 3 simultaneous)
- **Resource Limits**: Strict enforcement of size and time limits
- **Progress Streaming**: Real-time progress updates without blocking
- **Error Isolation**: Individual download failures don't affect others

### Bundle Optimization
- **Code Splitting**: Lazy loading of heavy components
- **Tree Shaking**: Elimination of unused code
- **Asset Optimization**: Compressed images and optimized fonts
- **Caching Strategy**: Efficient browser caching for static assets

This comprehensive walkthrough provides developers with a complete understanding of CollageForge's architecture, from basic image discovery to advanced merchandise integration. The system demonstrates modern React patterns, secure service worker implementation, canvas-based image processing, and real-world API integration with Printful's printing services.