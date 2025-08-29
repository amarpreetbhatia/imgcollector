# Product Overview

## Image Crawler App

A lightweight React application that crawls websites to discover and display images in an interactive carousel. The app provides a polite, ethical web crawling solution that respects robots.txt and website policies.

### Core Features

- **Polite Web Crawling**: Respects robots.txt, nofollow directives, and implements reasonable rate limiting
- **Smart Discovery**: Crawls main page plus one level of internal links (same domain only)
- **Interactive Gallery**: Responsive carousel and grid view modes with full-screen image preview
- **Secure Download**: Background service worker downloads all images as ZIP with comprehensive security measures
- **Comprehensive Limits**: 50 image limit, 3-minute timeout, domain restrictions
- **Modern UI**: Material-UI dark theme with responsive design for all devices
- **Error Resilience**: Graceful handling of network failures and invalid content

### Target Use Cases

- Website image discovery and analysis
- Content research and visual exploration
- Web development and design inspiration gathering
- Educational web crawling demonstrations

### Technical Approach

Client-server architecture bypasses CORS limitations while maintaining ethical crawling practices. The backend handles all web requests while the frontend focuses on user experience and image presentation.