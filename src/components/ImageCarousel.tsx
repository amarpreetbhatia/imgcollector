import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  Tooltip,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Alert,
  Snackbar,
  Checkbox,
  Badge,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  CollectionsBookmark as CollageIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import '../styles/carousel-custom.css';
import { ImageData } from '../types';
import { downloadService, DownloadProgress } from '../utils/downloadService';
import { collageService } from '../utils/collageService';

interface ImageCarouselProps {
  images: ImageData[];
  onBack: () => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, onBack }) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('carousel');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);
  const [collageSuccess, setCollageSuccess] = useState(false);
  const [collageError, setCollageError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1400 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 1400, min: 1024 },
      items: 4
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set(prev).add(imageUrl));
  };

  const handleImageClick = (image: ImageData) => {
    if (selectionMode) {
      toggleImageSelection(image.url);
    } else {
      setSelectedImage(image);
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageUrl)) {
        newSet.delete(imageUrl);
      } else if (newSet.size < 5) {
        newSet.add(imageUrl);
      }
      return newSet;
    });
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedImages(new Set());
    }
  };

  const getSelectedImageData = (): ImageData[] => {
    return validImages.filter(img => selectedImages.has(img.url));
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

  const handleOpenSource = (sourceUrl: string) => {
    window.open(sourceUrl, '_blank', 'noopener,noreferrer');
  };

  const validImages = images.filter(img => !imageErrors.has(img.url));

  // Download functionality
  const handleDownload = async () => {
    if (isDownloading || validImages.length === 0) {
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadError(null);
      setDownloadProgress(null);

      await downloadService.downloadImages(validImages, (progress) => {
        setDownloadProgress(progress);
      });

      setDownloadSuccess(true);
      setDownloadProgress(null);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError(error instanceof Error ? error.message : 'Download failed');
      setDownloadProgress(null);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelDownload = () => {
    if (isDownloading) {
      downloadService.cancelDownload();
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isDownloading) {
        downloadService.cancelDownload();
      }
    };
  }, [isDownloading]);

  // Close success message
  const handleCloseSuccess = () => {
    setDownloadSuccess(false);
  };

  // Close error message
  const handleCloseError = () => {
    setDownloadError(null);
  };

  // Collage functionality
  const handleGenerateCollage = async () => {
    if (selectedImages.size === 0) {
      setCollageError('Please select at least one image');
      return;
    }

    try {
      setIsGeneratingCollage(true);
      setCollageError(null);

      const selectedImageData = getSelectedImageData();
      const result = await collageService.generateCollage(selectedImageData);

      if (result.success && result.imageBlob) {
        collageService.downloadCollage(result.imageBlob, 'image-collage.png');
        setCollageSuccess(true);
        setSelectionMode(false);
        setSelectedImages(new Set());
      } else {
        setCollageError(result.error || 'Failed to generate collage');
      }
    } catch (error) {
      console.error('Collage generation failed:', error);
      setCollageError(error instanceof Error ? error.message : 'Failed to generate collage');
    } finally {
      setIsGeneratingCollage(false);
    }
  };

  const handleCloseCollageSuccess = () => {
    setCollageSuccess(false);
  };

  const handleCloseCollageError = () => {
    setCollageError(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={isMobile ? "flex-start" : "center"}
        mb={3}
        flexDirection={isMobile ? "column" : "row"}
        gap={2}
      >
        <Box>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            component="h1"
            gutterBottom
          >
            Found Images
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              label={`${validImages.length} images found`}
              color="primary"
              variant="outlined"
              size={isMobile ? "small" : "medium"}
            />
            {selectionMode && (
              <Chip
                label={`${selectedImages.size}/5 selected for collage`}
                color="secondary"
                variant="filled"
                size={isMobile ? "small" : "medium"}
              />
            )}
          </Box>
        </Box>

        <Box display="flex" gap={1} flexDirection={isMobile ? "column" : "row"} alignItems={isMobile ? "stretch" : "center"}>
          <Box display="flex" gap={1}>
            <Button
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              size={isMobile ? "small" : "medium"}
              onClick={() => setViewMode('grid')}
              disabled={isDownloading || isGeneratingCollage}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'carousel' ? 'contained' : 'outlined'}
              size={isMobile ? "small" : "medium"}
              onClick={() => setViewMode('carousel')}
              disabled={isDownloading || isGeneratingCollage}
            >
              Carousel
            </Button>
          </Box>
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant={selectionMode ? 'contained' : 'outlined'}
              color="secondary"
              startIcon={<CollageIcon />}
              onClick={toggleSelectionMode}
              disabled={isDownloading || isGeneratingCollage || validImages.length === 0}
              size={isMobile ? "small" : "medium"}
            >
              {selectionMode ? `Selected (${selectedImages.size}/5)` : 'Create Collage'}
            </Button>

            {selectionMode && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateCollage}
                disabled={selectedImages.size === 0 || isGeneratingCollage}
                size={isMobile ? "small" : "medium"}
              >
                {isGeneratingCollage ? 'Generating...' : `Generate Collage (${selectedImages.size})`}
              </Button>
            )}

            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={isDownloading ? handleCancelDownload : handleDownload}
              disabled={validImages.length === 0 || selectionMode || isGeneratingCollage}
              size={isMobile ? "small" : "medium"}
            >
              {isDownloading ? 'Cancel' : `Download All (${validImages.length})`}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              disabled={isDownloading || isGeneratingCollage}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? 'Back' : 'Back to Search'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Download Progress */}
      {isDownloading && downloadProgress && (
        <Box mb={3}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              {downloadProgress.message}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={downloadProgress.percentage} 
              sx={{ mt: 1 }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              {downloadProgress.current} of {downloadProgress.total} images ({downloadProgress.percentage}%)
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Images Carousel */}
      {validImages.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No valid images could be loaded
          </Typography>
          <Button
            variant="contained"
            onClick={onBack}
            sx={{ mt: 2 }}
          >
            Try Another URL
          </Button>
        </Box>
      ) : viewMode === 'carousel' ? (
        <Box sx={{ mb: 4 }}>
          <Carousel
            responsive={responsive}
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={3000}
            keyBoardControl={true}
            customTransition="all .5s"
            transitionDuration={500}
            containerClass="carousel-container"
            removeArrowOnDeviceType={["tablet", "mobile"]}
            dotListClass="custom-dot-list-style"
            itemClass="carousel-item-padding-40-px"
            showDots={true}
            ssr={true}
          >
            {validImages.map((image, index) => (
              <Box key={index} sx={{ px: 1 }}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    height: isMobile ? 250 : 200,
                    mx: 1,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleImageClick(image)}
                >
                  <Box position="relative" height="100%">
                    <CardMedia
                      component="img"
                      height="100%"
                      image={image.url}
                      alt={image.alt || 'Crawled image'}
                      onError={() => handleImageError(image.url)}
                      sx={{
                        objectFit: 'cover',
                        opacity: selectionMode && !selectedImages.has(image.url) ? 0.6 : 1,
                        transition: 'opacity 0.2s',
                      }}
                    />

                    {selectionMode && (
                      <Checkbox
                        checked={selectedImages.has(image.url)}
                        onChange={() => toggleImageSelection(image.url)}
                        disabled={!selectedImages.has(image.url) && selectedImages.size >= 5}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '50%',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                        }}
                        icon={<CheckCircleIcon />}
                        checkedIcon={<CheckCircleIcon />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}

                    {selectedImages.has(image.url) && (
                      <Badge
                        badgeContent={Array.from(selectedImages).indexOf(image.url) + 1}
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: selectionMode ? 48 : 8,
                          '& .MuiBadge-badge': {
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                      >
                        <Box width={20} height={20} />
                      </Badge>
                    )}

                    <Tooltip title="Open source page">
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSource(image.sourceUrl);
                        }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Box>
            ))}
          </Carousel>
        </Box>
      ) : (
        <Grid container spacing={isMobile ? 1 : 2}>
          {validImages.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleImageClick(image)}
              >
                <Box position="relative">
                  <CardMedia
                    component="img"
                    height={isMobile ? 180 : 200}
                    image={image.url}
                    alt={image.alt || 'Crawled image'}
                    onError={() => handleImageError(image.url)}
                    sx={{
                      objectFit: 'cover',
                      opacity: selectionMode && !selectedImages.has(image.url) ? 0.6 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  />

                  {selectionMode && (
                    <Checkbox
                      checked={selectedImages.has(image.url)}
                      onChange={() => toggleImageSelection(image.url)}
                      disabled={!selectedImages.has(image.url) && selectedImages.size >= 5}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                        },
                      }}
                      icon={<CheckCircleIcon />}
                      checkedIcon={<CheckCircleIcon />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                  {selectedImages.has(image.url) && (
                    <Badge
                      badgeContent={Array.from(selectedImages).indexOf(image.url) + 1}
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: selectionMode ? 48 : 8,
                        '& .MuiBadge-badge': {
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          fontWeight: 'bold',
                        },
                      }}
                    >
                      <Box width={20} height={20} />
                    </Badge>
                  )}

                  <Tooltip title="Open source page">
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSource(image.sourceUrl);
                      }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Image Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {selectedImage && (
            <>
              <IconButton
                onClick={handleCloseDialog}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>

              <Box
                component="img"
                src={selectedImage.url}
                alt={selectedImage.alt || 'Selected image'}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: isMobile ? '70vh' : '80vh',
                  objectFit: 'contain',
                }}
              />

              <Box p={isMobile ? 1 : 2}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{
                    wordBreak: 'break-all',
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  Source: {selectedImage.sourceUrl}
                </Typography>
                {selectedImage.alt && (
                  <Typography
                    variant="body2"
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Alt text: {selectedImage.alt}
                  </Typography>
                )}

                <Box mt={2}>
                  <Button
                    variant="contained"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => handleOpenSource(selectedImage.sourceUrl)}
                    size={isMobile ? "small" : "medium"}
                    fullWidth={isMobile}
                  >
                    Visit Source Page
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={downloadSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Images downloaded successfully! Check your downloads folder.
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!downloadError}
        autoHideDuration={8000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          Download failed: {downloadError}
        </Alert>
      </Snackbar>

      {/* Collage Success Snackbar */}
      <Snackbar
        open={collageSuccess}
        autoHideDuration={6000}
        onClose={handleCloseCollageSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCollageSuccess} severity="success" sx={{ width: '100%' }}>
          Collage generated successfully! Check your downloads folder.
        </Alert>
      </Snackbar>

      {/* Collage Error Snackbar */}
      <Snackbar
        open={!!collageError}
        autoHideDuration={8000}
        onClose={handleCloseCollageError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCollageError} severity="error" sx={{ width: '100%' }}>
          Collage generation failed: {collageError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImageCarousel;