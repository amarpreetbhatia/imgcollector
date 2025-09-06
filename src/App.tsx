import { useState, useEffect } from 'react';
import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import WelcomeScreen from './components/WelcomeScreen';
import ImageCarousel from './components/ImageCarousel';
import SEOHead from './components/SEOHead';
import { ImageData } from './types';
import { AppInitializer } from './services/AppInitializer';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // SEO and Accessibility: Update document title based on current view
  useEffect(() => {
    const baseTitle = 'VisualCraft Studio - AI-Powered Custom Print Studio';
    if (showCarousel && images.length > 0) {
      document.title = `${images.length} Images Found | ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [showCarousel, images.length]);

  // Accessibility: Announce page changes to screen readers
  useEffect(() => {
    const announcement = showCarousel 
      ? `Images loaded. Found ${images.length} images ready for enhancement and printing.`
      : 'Welcome to VisualCraft Studio. Enter a website URL to discover images.';
    
    // Create a live region for screen reader announcements
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = announcement;
    }
  }, [showCarousel, images.length]);

  const handleCrawlComplete = (crawledImages: ImageData[]) => {
    setImages(crawledImages);
    setShowCarousel(true);
    setIsLoading(false);
  };

  const handleBackToWelcome = () => {
    setShowCarousel(false);
    setImages([]);
  };

  return (
    <AppInitializer>
      <SEOHead 
        title={showCarousel && images.length > 0 
          ? `${images.length} Images Found | VisualCraft Studio - AI-Powered Custom Print Studio`
          : 'VisualCraft Studio - AI-Powered Custom Print Studio | Discover. Blend. Print. Perfect.'
        }
        description={showCarousel && images.length > 0
          ? `Found ${images.length} images ready for AI enhancement and custom printing. Create personalized posters, mugs, t-shirts and more.`
          : 'Transform any website into custom art. AI-powered image discovery, enhancement, and professional printing. Create personalized posters, mugs, and t-shirts from web content.'
        }
        keywords={showCarousel 
          ? ['AI image enhancement', 'custom printing', 'photo editing', 'personalized merchandise', 'print on demand']
          : ['AI image enhancement', 'custom printing', 'web image discovery', 'personalized art', 'photo collage', 'print on demand']
        }
      />
      
      {/* Accessibility: Skip to main content */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Accessibility: Live region for screen reader announcements */}
      <div 
        id="live-region" 
        aria-live="polite" 
        aria-atomic="true"
        style={{ 
          position: 'absolute', 
          left: '-10000px', 
          width: '1px', 
          height: '1px', 
          overflow: 'hidden' 
        }}
      />
      
      <Container 
        maxWidth="lg" 
        sx={{ px: isMobile ? 1 : 3 }}
        component="main"
        role="main"
        id="main-content"
      >
        <Box sx={{ minHeight: '100vh', py: isMobile ? 2 : 4 }}>
          {!showCarousel ? (
            <WelcomeScreen
              onCrawlComplete={handleCrawlComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          ) : (
            <ImageCarousel
              images={images}
              onBack={handleBackToWelcome}
            />
          )}
        </Box>
      </Container>
    </AppInitializer>
  );
}

export default App;