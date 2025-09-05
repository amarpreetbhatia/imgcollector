import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardMedia,
  IconButton,
  Alert,
  Divider,
  Stack,
  Chip,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  AutoFixHigh as MagicIcon
} from '@mui/icons-material';
import { BlendImageResult } from '../types';
import CollagePreviewDialog from './CollagePreviewDialog';

interface AIImagePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  result: BlendImageResult;
}

export const AIImagePreviewDialog: React.FC<AIImagePreviewDialogProps> = ({
  open,
  onClose,
  result
}) => {
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!result.imageUrl && !result.imageBlob) return;

    try {
      setDownloading(true);

      let blob: Blob;
      if (result.imageBlob) {
        blob = result.imageBlob;
      } else if (result.imageUrl) {
        const response = await fetch(result.imageUrl);
        blob = await response.blob();
      } else {
        throw new Error('No image data available');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-blended-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintOrder = () => {
    setShowPrintDialog(true);
  };

  const handleClosePrintDialog = () => {
    setShowPrintDialog(false);
  };

  const handleShare = async () => {
    if (navigator.share && result.imageUrl) {
      try {
        await navigator.share({
          title: 'AI Blended Image from CollageForge',
          text: 'Check out this AI-generated image I created!',
          url: result.imageUrl
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      if (result.imageUrl) {
        navigator.clipboard.writeText(result.imageUrl);
      }
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '600px' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MagicIcon color="primary" />
          AI Blended Image Result
          <IconButton
            onClick={onClose}
            sx={{ ml: 'auto' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Success Message */}
            <Alert severity="success" icon={<MagicIcon />}>
              <Typography variant="h6" gutterBottom>
                🎉 Your AI image has been generated successfully!
              </Typography>
              <Typography variant="body2">
                You can now download it, order a professional print, or share it with others.
              </Typography>
            </Alert>

            {/* Generated Image Preview */}
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MagicIcon color="primary" />
                Generated Image
              </Typography>

              <Card sx={{ maxWidth: '100%', mx: 'auto' }}>
                <CardMedia
                  component="img"
                  image={result.imageUrl || ''}
                  alt="AI Generated Blended Image"
                  sx={{
                    objectFit: 'contain',
                    maxHeight: 400,
                    width: '100%'
                  }}
                />
              </Card>

              {/* Image Info */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="AI Generated"
                  color="primary"
                  variant="filled"
                  size="small"
                />
                <Chip
                  label="High Quality"
                  color="success"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label="Print Ready"
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Paper>

            <Divider />

            {/* Action Options */}
            <Box>
              <Typography variant="h6" gutterBottom>
                What would you like to do next?
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                {/* Download Option */}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    flex: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      elevation: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={handleDownload}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <DownloadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      {downloading ? 'Downloading...' : 'Download'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Save to your device for personal use
                    </Typography>
                  </Box>
                </Paper>

                {/* Print Order Option */}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    flex: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    '&:hover': {
                      elevation: 3,
                      transform: 'translateY(-2px)',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                    }
                  }}
                  onClick={handlePrintOrder}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <PrintIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Order Print
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Professional poster printing & shipping
                    </Typography>
                    <Chip
                      label="Starting at $15.95"
                      color="secondary"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Paper>

                {/* Share Option */}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    flex: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      elevation: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={handleShare}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <ShareIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Share
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Share with friends and social media
                    </Typography>
                  </Box>
                </Paper>
              </Stack>
            </Box>

            {/* Additional Info */}
            <Alert severity="info">
              <Typography variant="body2">
                💡 <strong>Pro Tip:</strong> Your AI-generated image is optimized for printing at poster sizes.
                Order a professional print to see the full quality and detail!
              </Typography>
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
          <Button
            onClick={handlePrintOrder}
            variant="contained"
            color="secondary"
            startIcon={<PrintIcon />}
          >
            Order Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Order Dialog */}
      {showPrintDialog && result.imageBlob && (
        <CollagePreviewDialog
          open={showPrintDialog}
          onClose={handleClosePrintDialog}
          imageBlob={result.imageBlob}
          imageUrl={result.imageUrl || ''}
          isAIGenerated={true}
        />
      )}
    </>
  );
};