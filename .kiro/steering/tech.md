# Technology Stack & Build System

## Frontend Stack

- **React 18** with TypeScript for type safety
- **Material-UI (MUI) v5** for components and dark theme
- **React Multi Carousel** for responsive image galleries
- **Vite** as build tool and dev server
- **Vitest** for testing with jsdom environment

## Backend Stack

- **Node.js** with Express server
- **Cheerio** for HTML parsing and DOM manipulation
- **Axios** for HTTP requests with timeout handling
- **Robots Parser** for robots.txt compliance
- **CORS** middleware for cross-origin requests

## Development Tools

- **TypeScript** with strict mode enabled
- **ESLint** with React app configuration
- **Nodemon** for backend auto-restart during development
- **Concurrently** for running frontend and backend simultaneously

## Common Commands

### Development
```bash
# Start both frontend and backend
npm run dev

# Start frontend only
npm start

# Start backend only (development mode)
npm run server:dev

# Start backend only (production mode)
npm run server
```

### Setup & Installation
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run install:server

# Run setup script
npm run setup
```

### Testing & Building
```bash
# Run tests
npm test

# Build for production
npm run build

# Run tests with coverage
npm run test -- --coverage
```

## Architecture Notes

- **Client-Server Pattern**: Frontend (port 3000) + Backend (port 3001)
- **CORS Bypass**: Backend handles web crawling to avoid browser CORS restrictions
- **Service Worker**: Background download processing with security isolation
- **Responsive Design**: Mobile-first approach with Material-UI breakpoints
- **Error Boundaries**: Comprehensive error handling at component and network levels
- **Security-First**: Multi-layer security for download feature with resource limits

## Configuration Files

- `vite.config.ts`: Vite build configuration with Vitest setup
- `tsconfig.json`: TypeScript compiler options with strict mode
- `package.json`: Scripts and dependencies for both frontend and backend