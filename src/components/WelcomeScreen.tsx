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

        {/* How it Works - Clickable */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<PlayIcon />}
            onClick={() => setDemoModalOpen(true)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
              py: 1.5,
              px: 3,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
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
            <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
              🚀 Why Choose CollageForge?
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h2" sx={{ mb: 1 }}>🔍</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Smart Discovery
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Find up to 50 high-quality images from any website with our intelligent crawler
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h2" sx={{ mb: 1 }}>🎨</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Auto Layouts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create stunning collages with smart auto-layouts optimized for printing
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h2" sx={{ mb: 1 }}>🛍️</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    9 Products
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transform into posters, t-shirts, mugs, phone cases, and more premium products
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
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ✨ How CollageForge Works
          </Typography>
          <IconButton onClick={() => setDemoModalOpen(false)} size="small">
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
                alt="CollageForge Workflow - From Discovery to Delivery"
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