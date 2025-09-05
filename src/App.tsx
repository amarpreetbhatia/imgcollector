import { useState } from 'react';
import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import WelcomeScreen from './components/WelcomeScreen';
import ImageCarousel from './components/ImageCarousel';
import { ImageData } from './types';
import { AppInitializer } from './services/AppInitializer';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      <Container maxWidth="lg" sx={{ px: isMobile ? 1 : 3 }}>
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