# Image Crawler App

A lightweight React application that crawls websites to discover and display images in an interactive carousel.

## Features

- **Polite Crawling**: Respects robots.txt and nofollow directives
- **Smart Limits**: Collects up to 50 images or stops after 3 minutes
- **Two-Level Crawling**: Crawls main page + one level of internal links
- **Interactive Gallery**: Click images to view full size and visit source
- **Dual View Modes**: Switch between carousel and grid layouts
- **Joy UI Progress**: Beautiful circular progress indicator during crawling
- **Fully Responsive**: Optimized for mobile, tablet, and desktop viewports
- **Dark Theme**: Modern Material-UI dark theme design
- **Error Handling**: Comprehensive error messages for edge cases

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for components and dark theme
- **Joy UI** for enhanced progress indicators
- **React Multi Carousel** for responsive carousel functionality
- **Node.js/Express** backend for web crawling
- **Cheerio** for HTML parsing and crawling
- **Axios** for HTTP requests with timeout handling

## Getting Started

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
npm run install:server
```

3. Start both frontend and backend servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend React app on http://localhost:3000

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Alternative: Start servers separately

Backend server:
```bash
npm run server:dev
```

Frontend (in another terminal):
```bash
npm start
```

## How It Works

1. Enter any website URL on the welcome screen
2. The app crawls the main page for images
3. It then follows internal links (same domain) one level deep
4. Images are displayed in a responsive grid carousel
5. Click any image to view full size and access source page

## Crawling Behavior

- **Robots.txt Compliance**: Checks and respects robots.txt files
- **Nofollow Respect**: Skips links marked with rel="nofollow"
- **Same Domain Only**: Only follows links within the same domain
- **Time Limit**: Stops crawling after 3 minutes maximum
- **Image Limit**: Stops after finding 50 images
- **Error Resilience**: Continues crawling even if some pages fail

## Architecture

The app uses a client-server architecture to bypass CORS limitations:

- **Frontend (React)**: User interface and image display
- **Backend (Node.js/Express)**: Handles web crawling and image extraction

This allows crawling any public website without CORS restrictions.

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `build` folder ready for deployment.