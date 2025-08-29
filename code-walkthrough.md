# Code Walkthrough - Image Crawler Application

## Architecture Overview

This is a full-stack React + Node.js application that crawls websites to extract and display images with secure bulk download capabilities. The application follows a client-server architecture with service worker isolation for downloads.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Material-UI + Vite
- **Backend**: Node.js + Express + Cheerio + Axios
- **Download System**: Service Worker + JSZip + Security Validation
- **Testing**: Vitest + React Testing Library

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

## Data Flow Architecture

### 1. Application Entry Point (`src/index.tsx`)
- Sets up React root with Material-UI dark theme
- Provides global CSS baseline and theme context
- Renders the main App component

### 2. Main Application State (`src/App.tsx`)
**State Management:**
- `images`: Array of crawled image data
- `isLoading`: Loading state for crawl operations
- `showCarousel`: Toggle between welcome screen and image display

**Component Flow:**
```
App → WelcomeScreen (initial) → ImageCarousel (after crawl)
```

### 3. Welcome Screen Component (`src/components/WelcomeScreen.tsx`)
**Responsibilities:**
- URL input validation and normalization
- Progress tracking with simulated updates
- Error handling and user feedback
- Initiates crawling process

**Key Algorithms:**
- **URL Validation**: Attempts to construct URL object, adds https:// prefix if missing
- **Progress Simulation**: Random incremental updates (0-90%) during crawl, jumps to 100% on completion

### 4. Image Carousel Component (`src/components/ImageCarousel.tsx`)
**Display Modes:**
- **Carousel Mode**: Uses react-multi-carousel with responsive breakpoints
- **Grid Mode**: Material-UI Grid layout with responsive columns

**Key Features:**
- Image error handling with fallback removal
- Full-screen image dialog with source attribution
- Responsive design with mobile-first approach
- External link handling with security attributes
- **Secure Bulk Download**: Integrated download functionality with progress tracking

**Download Integration:**
- Smart button states (Download All/Cancel based on state)
- Real-time progress tracking with LinearProgress component
- Error handling with Snackbar notifications
- Success feedback and automatic cleanup
- Download cancellation support

**Responsive Breakpoints:**
```javascript
superLargeDesktop: 5 items (1400px+)
desktop: 4 items (1024-1400px)
tablet: 2 items (464-1024px)
mobile: 1 item (0-464px)
```

## Backend Architecture (`server/server.js`)

### ImageCrawler Class
**Core Algorithm:**
1. **Initialization**: Reset state (visited URLs, found images, start time)
2. **Robots.txt Check**: Verify crawling permissions for domain
3. **Recursive Crawling**: Main page + one level of internal links (max depth: 1)
4. **Image Extraction**: Parse HTML with Cheerio, extract img tags
5. **Link Following**: Extract and follow same-domain links (max 10 per page)

**Crawling Rules:**
- **Time Limit**: 3 minutes maximum crawl duration
- **Image Limit**: 50 images maximum
- **Depth Limit**: 2 levels (main page + 1 level of internal links)
- **Domain Restriction**: Only follows links within same domain
- **Robots.txt Compliance**: Respects robots.txt and nofollow directives

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

## Download Architecture

### Service Worker (`public/download-worker.js`)

**Core Components:**
- **SecureImageDownloader**: Main download orchestration class
- **Semaphore**: Concurrent download control (max 3 simultaneous)
- **Security Validation**: Multi-layer input and content validation

**Download Algorithm:**
1. **Input Validation**: URL format, array structure, count limits
2. **Batch Processing**: Process images with concurrency control
3. **Individual Download**: Fetch with timeout, MIME validation, size checks
4. **ZIP Creation**: JSZip with metadata file generation
5. **Blob Delivery**: Return ZIP blob to main thread

**Security Measures:**
- File size limits (50MB per image, 500MB total)
- MIME type whitelist (image formats only)
- URL protocol validation (HTTP/HTTPS only)
- Timeout protection (30 seconds per image)
- Filename sanitization and collision prevention

### Download Service (`src/utils/downloadService.ts`)

**Responsibilities:**
- Service worker lifecycle management
- Message passing and request ID tracking
- Progress callback handling
- Automatic blob URL cleanup
- Error propagation and user feedback

**Communication Pattern:**
```javascript
Main Thread ←→ Service Worker
    ↓              ↓
DownloadService ←→ SecureImageDownloader
    ↓              ↓
UI Updates    ←→  Progress Events
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
```

## Key Algorithms & Rules

### URL Resolution Algorithm
1. **Normalization**: Add https:// prefix if protocol missing
2. **Absolute URL Construction**: Use URL constructor with base URL
3. **Domain Validation**: Extract hostname for same-domain checks
4. **Path Resolution**: Handle relative paths, query parameters, fragments

### Crawling Termination Rules
```javascript
shouldStop() {
  return (
    foundImages.size >= MAX_IMAGES ||           // 50 image limit
    Date.now() - startTime >= MAX_TIME_MS ||   // 3 minute limit
    visitedUrls.size >= MAX_PAGES              // Implicit page limit
  );
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

### Concurrency Control (Semaphore Pattern)
```javascript
class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;  // 3 for downloads
    this.currentConcurrency = 0;
    this.queue = [];
  }
  
  async acquire(task) {
    // Queue task if at capacity, otherwise execute immediately
    // Automatically releases slot when task completes
  }
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

## Data Flow Patterns

### Complete Application Flow
```
1. User Input (URL) → WelcomeScreen
2. Validation → API Call → Backend Crawler
3. HTML Parsing → Image Extraction → Response
4. Image Display → ImageCarousel (Grid/Carousel)
5. Download Request → DownloadService → Service Worker
6. Parallel Downloads → ZIP Creation → File Download
7. Progress Updates → UI Feedback → Completion
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

### Error Propagation Chain
```
Service Worker Error → DownloadService → ImageCarousel → Snackbar
Network Error → Fetch Failure → Error Message → User Notification
Validation Error → Early Rejection → Error State → UI Feedback
```

## Component Lifecycle Management

### Download State Management
- **Initialization**: Service worker registration and setup
- **Active Download**: Progress tracking and cancellation support  
- **Completion**: Resource cleanup and success notification
- **Error Handling**: Graceful degradation and user feedback
- **Cleanup**: Component unmount cleanup and worker termination