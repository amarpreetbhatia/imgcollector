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
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          component="h1" 
          gutterBottom 
          color="primary"
        >
          Image Crawler
        </Typography>
        
        <Typography 
          variant={isMobile ? "body1" : "h6"} 
          color="text.secondary" 
          paragraph
        >
          Discover and browse images from any website
        </Typography>

        <Box sx={{ mt: 4, mb: 3 }}>
          <TextField
            fullWidth
            label="Enter Website URL"
            placeholder="example.com or https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            error={!!error}
            helperText={error || 'We\'ll crawl up to 50 images within 3 minutes'}
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
                Crawling images... {Math.round(progress)}%
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
            {isLoading ? 'Crawling...' : 'Start Crawling'}
          </Button>
        </Box>

        <Alert severity="info" sx={{ textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Features:</strong>
            <br />
            • Respects robots.txt and nofollow directives
            <br />
            • Crawls main page + one level of internal links
            <br />
            • Collects up to 50 images or stops after 3 minutes
            <br />
            • Click any image to visit its source page
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default WelcomeScreen;