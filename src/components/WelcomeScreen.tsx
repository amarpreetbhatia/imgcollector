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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, PlayCircleOutline as PlayIcon } from '@mui/icons-material';
import { imageCrawler } from '../utils/crawler';
import { ImageData } from '../types';
// import MerchandiseShowcase from './MerchandiseShowcase'; // Hidden

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
  const [demoModalOpen, setDemoModalOpen] = useState(false);
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
            alt="VisualCraft Studio Logo - AI-Powered Custom Print Studio"
            style={{
              height: isMobile ? '50px' : '60px',
              width: 'auto'
            }}
          />
        </Box>

        <Typography
          variant={isMobile ? "h6" : "h5"}
          component="h1"
          sx={{ 
            fontWeight: 800, 
            mb: 2,
            background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 50%, #8B5CF6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            letterSpacing: '-0.025em'
          }}
        >
          VisualCraft Studio
        </Typography>

        <Typography
          variant={isMobile ? "body1" : "h6"}
          color="text.secondary"
          paragraph
          sx={{ fontWeight: 500 }}
        >
          Transform any website into custom art with AI enhancement
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{ mb: 3, fontStyle: 'italic', fontWeight: 'medium' }}
        >
          Discover • Blend • Print • Perfect
        </Typography>

        <Box sx={{ mt: 4, mb: 3 }}>
          <TextField
            fullWidth
            label="Enter Website URL to Discover Images"
            placeholder="example.com or https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCrawl()}
            disabled={isLoading}
            error={!!error}
            helperText={error || 'We\'ll discover up to 50 images for AI enhancement and custom printing'}
            sx={{ mb: 3 }}
            inputProps={{
              'aria-describedby': 'url-helper-text',
              'aria-label': 'Website URL input for image discovery'
            }}
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

        {/* How it Works - Clickable */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<PlayIcon />}
            onClick={() => setDemoModalOpen(true)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              py: 1.5,
              px: 3,
              borderWidth: '2px',
              borderColor: 'primary.main',
              color: 'primary.main',
              background: 'rgba(59, 130, 246, 0.05)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: 'white',
                borderColor: 'primary.main',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 15px -3px rgb(59 130 246 / 0.3)',
              }
            }}
          >
            ✨ See How It Works
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, fontStyle: 'italic' }}
          >
            Watch our 5-step process in action
          </Typography>
        </Box>
      </Paper>

      {/* Feature Highlights */}
      {!isLoading && (
        <Box sx={{ mt: 4, width: '100%', maxWidth: 1000 }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography 
              variant="h5" 
              component="h2"
              sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}
            >
              🚀 Why Choose VisualCraft Studio?
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }} role="region" aria-labelledby="feature-discovery">
                  <Typography variant="h2" sx={{ mb: 1 }} aria-hidden="true">🔍</Typography>
                  <Typography 
                    id="feature-discovery"
                    variant="h6" 
                    component="h3"
                    sx={{ fontWeight: 'bold', mb: 1 }}
                  >
                    Smart Discovery
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Find up to 50 high-quality images from any website with our intelligent AI-powered crawler
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }} role="region" aria-labelledby="feature-enhancement">
                  <Typography variant="h2" sx={{ mb: 1 }} aria-hidden="true">✨</Typography>
                  <Typography 
                    id="feature-enhancement"
                    variant="h6" 
                    component="h3"
                    sx={{ fontWeight: 'bold', mb: 1 }}
                  >
                    AI Enhancement
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Blend images with AI, add custom text, and create stunning visual compositions
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }} role="region" aria-labelledby="feature-products">
                  <Typography variant="h2" sx={{ mb: 1 }} aria-hidden="true">🛍️</Typography>
                  <Typography 
                    id="feature-products"
                    variant="h6" 
                    component="h3"
                    sx={{ fontWeight: 'bold', mb: 1 }}
                  >
                    Premium Products
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Professional printing on posters, t-shirts, mugs, phone cases, and more premium merchandise
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Merchandise Showcase - Hidden */}
      {/* 
      {!isLoading && (
        <Box sx={{ mt: 2, width: '100%', maxWidth: 1200 }}>
          <MerchandiseShowcase onExplore={() => {}} />
        </Box>
      )}
      */}

      {/* Demo Modal */}
      <Dialog
        open={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            ✨ How VisualCraft Studio Works
          </Typography>
          <IconButton 
            onClick={() => setDemoModalOpen(false)} 
            size="small"
            aria-label="Close demo modal"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          {/* Demo GIF Section */}
          <Paper
            elevation={2}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: isMobile ? 250 : 400,
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'primary.light'
              }}
            >
              <img
                src="/app-demo.gif"
                alt="VisualCraft Studio workflow demonstration: Enter website URL, discover images, enhance with AI, create custom products, and order professional prints"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </Box>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 1,
                fontStyle: 'italic',
                color: 'text.secondary'
              }}
            >
              🎥 Complete workflow: URL → Images → Collage → Products → Order
            </Typography>
          </Paper>

          <Alert severity="info" sx={{ textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Simple 5-Step Process:</strong>
              <br />
              • 🔍 <strong>Discover:</strong> Enter any website URL to find images
              <br />
              • 🎨 <strong>Select:</strong> Choose up to 5 images for your collage
              <br />
              • 🖼️ <strong>Create:</strong> Auto-generate beautiful collage layouts
              <br />
              • 🛍️ <strong>Customize:</strong> Pick from posters, t-shirts, mugs & more
              <br />
              • 📦 <strong>Order:</strong> Get professional merchandise delivered worldwide
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDemoModalOpen(false)}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Got It!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WelcomeScreen;