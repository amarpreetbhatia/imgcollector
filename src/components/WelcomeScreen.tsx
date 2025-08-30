import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  LinearProgress,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { imageCrawler } from '../utils/crawler';
import { ImageData } from '../types';

interface WelcomeScreenProps {
  onCrawlComplete: (images: ImageData[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onCrawlComplete,
  isLoading,
  setIsLoading,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const validateUrl = (inputUrl: string): boolean => {
    try {
      const normalizedUrl = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`;
      new URL(normalizedUrl);
      return true;
    } catch {
      return false;
    }
  };

  const handleCrawl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url.trim())) {
      setError('Please enter a valid URL');
      return;
    }

    setError('');
    setIsLoading(true);
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      const result = await imageCrawler.crawl(url.trim());
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.images.length === 0) {
        setError('No images found on the provided URL');
        setIsLoading(false);
        return;
      }

      setTimeout(() => {
        onCrawlComplete(result.images);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleCrawl();
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      px={isMobile ? 2 : 4}
    >
      <Paper
        elevation={3}
        sx={{
          p: isMobile ? 3 : 4,
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
          mx: 'auto',
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/logo.svg" 
            alt="CollageForge Logo" 
            style={{ 
              height: isMobile ? '50px' : '60px',
              width: 'auto'
            }}
          />
        </Box>
        
        <Typography 
          variant={isMobile ? "body1" : "h6"} 
          color="text.secondary" 
          paragraph
          sx={{ fontWeight: 500 }}
        >
          Create stunning photo collages and order custom prints
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary" 
          paragraph
          sx={{ mb: 3, fontStyle: 'italic' }}
        >
          Discover • Create • Print
        </Typography>

        <Box sx={{ mt: 4, mb: 3 }}>
          <TextField
            fullWidth
            label="Enter Website URL to Source Images"
            placeholder="example.com or https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            error={!!error}
            helperText={error || 'We\'ll discover up to 50 images to create your collage'}
            sx={{ mb: 3 }}
          />

          {isLoading && (
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress 
                size={isMobile ? 60 : 80}
                thickness={4}
                sx={{ 
                  color: 'primary.main',
                  animationDuration: '550ms',
                }}
              />
              <LinearProgress variant="determinate" value={progress} sx={{ width: '100%' }} />
              <Typography variant="body2" color="text.secondary">
                Discovering images for your collage... {Math.round(progress)}%
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            size={isMobile ? "medium" : "large"}
            startIcon={!isLoading && <SearchIcon />}
            onClick={handleCrawl}
            disabled={isLoading}
            sx={{ 
              minWidth: isMobile ? 150 : 200,
              fontSize: isMobile ? '0.875rem' : '1rem'
            }}
          >
            {isLoading ? 'Discovering Images...' : 'Discover Images'}
          </Button>
        </Box>

        <Alert severity="info" sx={{ textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>How it works:</strong>
            <br />
            • 🔍 Discover images from any website (up to 50 images)
            <br />
            • 🎨 Select up to 5 images to create your custom collage
            <br />
            • 🖼️ Preview your collage with smart auto-layouts
            <br />
            • 🖨️ Order professional prints (12"×18" to 24"×36")
            <br />
            • 📦 Get your custom poster delivered to your door
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default WelcomeScreen;