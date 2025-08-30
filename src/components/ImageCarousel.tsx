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
  Stack,
  Divider,
  Paper,
  ButtonGroup,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  CollectionsBookmark as CollageIcon,
  CheckCircle as CheckCircleIcon,
  ViewModule as GridIcon,
  ViewCarousel as CarouselIcon,
} from '@mui/icons-material';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import '../styles/carousel-custom.css';
import { ImageData } from '../types';
import { downloadService, DownloadProgress } from '../utils/downloadService';
import { collageService } from '../utils/collageService';
import CollagePreviewDialog from './CollagePreviewDialog';

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
  const [collagePreview, setCollagePreview] = useState<{
    blob: Blob | null;
    url: string | null;
  }>({ blob: null, url: null });
  const [showCollagePreview, setShowCollagePreview] = useState(false);
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

      if (result.success && result.imageBlob && result.imageUrl) {
        setCollagePreview({
          blob: result.imageBlob,
          url: result.imageUrl,
        });
        setShowCollagePreview(true);
        setCollageSuccess(true);
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

  const handleCloseCollagePreview = () => {
    setShowCollagePreview(false);
    // Clean up the object URL to prevent memory leaks
    if (collagePreview.url) {
      URL.revokeObjectURL(collagePreview.url);
    }
    setCollagePreview({ blob: null, url: null });
    setSelectionMode(false);
    setSelectedImages(new Set());
  };

  return (
    <Box>
      {/* Header Section - Improved UX */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
        }}
      >
        {/* Logo and Title Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <img
              src="/logo-compact.svg"
              alt="CollageForge"
              style={{
                height: isMobile ? '30px' : '35px',
                width: 'auto'
              }}
            />
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 0.5
                }}
              >
                Create Your Collage
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
              >
                Select up to 5 images to create a custom poster
              </Typography>
            </Box>
          </Box>

          {/* Status Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`${validImages.length} images discovered`}
              color="primary"
              variant="filled"
              size={isMobile ? "small" : "medium"}
              sx={{ fontWeight: 'medium' }}
            />
            {selectionMode && (
              <Chip
                label={`${selectedImages.size}/5 selected for collage`}
                color="secondary"
                variant="filled"
                size={isMobile ? "small" : "medium"}
                sx={{ fontWeight: 'medium' }}
              />
            )}
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Action Controls - Reorganized for better UX */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between'
        }}>

          {/* Primary Actions - Left Side */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flex: 1 }}>
            {/* Collage Creation - Primary CTA */}
            {!selectionMode ? (
              <Button
                variant="contained"
                color="secondary"
                size={isMobile ? "medium" : "large"}
                startIcon={<CollageIcon />}
                onClick={toggleSelectionMode}
                disabled={isDownloading || isGeneratingCollage || validImages.length === 0}
                sx={{
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
                aria-label="Start creating a collage by selecting images"
              >
                🎨 Create Collage
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  size={isMobile ? "medium" : "large"}
                  onClick={handleGenerateCollage}
                  disabled={selectedImages.size === 0 || isGeneratingCollage}
                  sx={{
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                  aria-label={`Generate collage with ${selectedImages.size} selected images`}
                >
                  {isGeneratingCollage ? '🎨 Creating...' : `✨ Generate (${selectedImages.size})`}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={toggleSelectionMode}
                  disabled={isGeneratingCollage}
                  sx={{ textTransform: 'none' }}
                  aria-label="Cancel collage creation and return to browsing"
                >
                  Cancel
                </Button>
              </Stack>
            )}

            {/* Download All - Secondary Action */}
            {!selectionMode && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={isDownloading ? handleCancelDownload : handleDownload}
                disabled={validImages.length === 0 || isGeneratingCollage}
                size={isMobile ? "medium" : "large"}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2
                }}
                aria-label={`Download all ${validImages.length} images as ZIP file`}
              >
                {isDownloading ? 'Cancel Download' : `📥 Download All (${validImages.length})`}
              </Button>
            )}
          </Stack>

          {/* View Controls and Navigation - Right Side */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* View Mode Toggle */}
            <ButtonGroup
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              disabled={isDownloading || isGeneratingCollage}
              aria-label="Switch between grid and carousel view"
            >
              <Button
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('grid')}
                startIcon={<GridIcon />}
                sx={{ textTransform: 'none' }}
                aria-label="Switch to grid view"
                aria-pressed={viewMode === 'grid'}
              >
                {!isMobile && 'Grid'}
              </Button>
              <Button
                variant={viewMode === 'carousel' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('carousel')}
                startIcon={<CarouselIcon />}
                sx={{ textTransform: 'none' }}
                aria-label="Switch to carousel view"
                aria-pressed={viewMode === 'carousel'}
              >
                {!isMobile && 'Carousel'}
              </Button>
            </ButtonGroup>

            {/* Back Navigation */}
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              disabled={isDownloading || isGeneratingCollage}
              size={isMobile ? "small" : "medium"}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
              aria-label="Go back to discover new images"
            >
              {isMobile ? 'New Search' : 'Discover New Images'}
            </Button>
          </Stack>
        </Box>
      </Paper>



      {/* Download Progress - Enhanced UX */}
      {isDownloading && downloadProgress && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(21, 101, 192, 0.05) 100%)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              📥
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Downloading Images
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {downloadProgress.message}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {downloadProgress.current} of {downloadProgress.total} images
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={downloadProgress.percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4
                }
              }}
            />
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                display: 'block',
                textAlign: 'center',
                fontWeight: 'medium'
              }}
            >
              {downloadProgress.percentage}% Complete
            </Typography>
          </Box>

          <Button
            variant="outlined"
            color="error"
            onClick={handleCancelDownload}
            size="small"
            sx={{ textTransform: 'none' }}
            aria-label="Cancel the current download"
          >
            Cancel Download
          </Button>
        </Paper>
      )}

      {/* Images Carousel */}
      {validImages.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No images found for collage creation
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Try a different website with more visual content
          </Typography>
          <Button
            variant="contained"
            onClick={onBack}
            sx={{ mt: 2 }}
          >
            🔍 Try Another Website
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

                    {/* Selection Controls */}
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
                        aria-label={`${selectedImages.has(image.url) ? 'Remove' : 'Add'} image ${Array.from(selectedImages).indexOf(image.url) + 1 || selectedImages.size + 1} to collage selection`}
                      />
                    )}

                    {/* Selection Number Badge */}
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
                            fontSize: '0.75rem',
                            minWidth: '20px',
                            height: '20px'
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

                  {/* Selection Controls */}
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
                      aria-label={`${selectedImages.has(image.url) ? 'Remove' : 'Add'} image ${Array.from(selectedImages).indexOf(image.url) + 1 || selectedImages.size + 1} to collage selection`}
                    />
                  )}

                  {/* Selection Number Badge */}
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
                          fontSize: '0.75rem',
                          minWidth: '20px',
                          height: '20px'
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
                src={selectedImage?.url}
                alt={selectedImage?.alt || 'Selected image'}
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
                  Source: {selectedImage?.sourceUrl}
                </Typography>
                {selectedImage?.alt && (
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
                    onClick={() => selectedImage && handleOpenSource(selectedImage.sourceUrl)}
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

      {/* Collage Success Notification */}
      <Snackbar
        open={collageSuccess}
        autoHideDuration={6000}
        onClose={handleCloseCollageSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCollageSuccess} severity="success" sx={{ width: '100%' }}>
          🎉 Your collage is ready! Preview and order your custom print.
        </Alert>
      </Snackbar>

      {/* Collage Error Notification */}
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

      {/* Collage Success Notification */}
      <Snackbar
        open={collageSuccess}
        autoHideDuration={6000}
        onClose={handleCloseCollageSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCollageSuccess} severity="success" sx={{ width: '100%' }}>
          🎉 Your collage is ready! Preview and order your custom print.
        </Alert>
      </Snackbar>

      {/* Collage Error Notification */}
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

      {/* Collage Preview Dialog */}
      <CollagePreviewDialog
        open={showCollagePreview}
        onClose={handleCloseCollagePreview}
        imageBlob={collagePreview.blob}
        imageUrl={collagePreview.url}
      />
    </Box>
  );
};

export default ImageCarousel;