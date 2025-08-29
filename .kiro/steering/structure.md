# Project Structure & Organization

## Root Directory Layout

```
├── src/                    # React frontend source code
├── server/                 # Node.js backend server
├── public/                 # Static assets (favicon, index.html)
├── build/                  # Production build output
├── node_modules/           # Frontend dependencies
├── .kiro/                  # Kiro IDE configuration and steering
├── .vscode/                # VS Code workspace settings
└── .git/                   # Git repository data
```

## Frontend Structure (`src/`)

```
src/
├── components/             # React components
│   ├── ImageCarousel.tsx   # Main image display component
│   └── WelcomeScreen.tsx   # URL input and crawl initiation
├── utils/                  # Utility functions and API clients
│   ├── crawler.ts          # Backend API communication
│   ├── downloadService.ts  # Secure download service with worker management
│   └── securityConfig.ts   # Security configuration and validation
├── styles/                 # Custom CSS styles
│   └── carousel-custom.css # Carousel-specific styling
├── test/                   # Test files and test utilities
├── App.tsx                 # Main application component
├── index.tsx               # React application entry point
└── types.ts                # TypeScript interface definitions
```

## Backend Structure (`server/`)

```
server/
├── node_modules/           # Backend-specific dependencies
├── package.json            # Backend dependencies and scripts
├── package-lock.json       # Backend dependency lock file
└── server.js               # Express server with crawling logic
```

## Component Organization Patterns

### Component Naming
- Use PascalCase for component files (e.g., `ImageCarousel.tsx`)
- Match filename to default export component name
- Place related components in logical groupings

### File Responsibilities
- **App.tsx**: Main state management and routing logic
- **components/**: Reusable UI components with single responsibilities
- **utils/**: Pure functions and API clients
- **types.ts**: Centralized TypeScript interfaces
- **styles/**: Component-specific CSS when Material-UI theming isn't sufficient

## Configuration Files Location

- **Root level**: Build tools, package management, IDE settings
- **Frontend config**: `tsconfig.json`, `vite.config.ts`, `package.json`
- **Backend config**: `server/package.json`
- **IDE config**: `.kiro/` for Kiro settings, `.vscode/` for VS Code

## Import Conventions

- **Relative imports** for local files: `./components/ImageCarousel`
- **Absolute imports** for external packages: `@mui/material`
- **Type imports** explicitly marked: `import type { ImageData } from './types'`

## Asset Organization

- **Static assets**: Place in `public/` directory
- **Component styles**: Co-locate with components or in `src/styles/`
- **Images**: Reference via public URL paths in production builds