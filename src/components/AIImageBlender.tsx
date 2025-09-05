import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardMedia,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  AutoFixHigh as MagicIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { ImageData, BlendImageRequest, BlendImageResult } from '../types';
import { getServices } from '../services/ServiceInitializer';
import { IAIImageService } from '../services/interfaces/IAIImageService';
import { AIImagePreviewDialog } from './AIImagePreviewDialog';
import logger, { logUserAction, startTimer } from '../utils/logger';

interface AIImageBlenderProps {
  open: boolean;
  onClose: () => void;
  selectedImage: ImageData | null;
  onImageGenerated: (result: BlendImageResult) => void;
}

export const AIImageBlender: React.FC<AIImageBlenderProps> = ({
  open,
  onClose,
  selectedImage,
  onImageGenerated
}) => {
  // Component lifecycle logging
  React.useEffect(() => {
    if (open) {
      logger.debug('AI Image Blender opened', 'AIImageBlender', 'open', { selectedImageUrl: selectedImage?.url });
    }
  }, [open, selectedImage?.url]);
  const [userImage, setUserImage] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<'realistic' | 'artistic' | 'cartoon' | 'abstract'>('realistic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<BlendImageResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get AI service with error handling
  let aiImage: IAIImageService | null = null;
  try {
    const services = getServices();
    aiImage = services.aiImage;
  } catch (error) {
    logger.error('Failed to initialize AI services', 'AIImageBlender', 'service_init', error);
    aiImage = null;
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file must be smaller than 10MB');
        return;
      }
      
      setUserImage(file);
      setError(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setUserImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      logger.warn('Generate attempted without base image', 'AIImageBlender', 'validation_error');
      setError('No base image selected');
      return;
    }

    if (!aiImage) {
      logger.error('AI service not available', 'AIImageBlender', 'service_error');
      setError('AI service not available. Please refresh the page and try again.');
      return;
    }

    const endTimer = startTimer('AI Image Generation');

    setLoading(true);
    setError(null);

    const request: BlendImageRequest = {
      baseImageUrl: selectedImage.url,
      userImage: userImage || undefined,
      text: text.trim() || undefined,
      prompt: prompt.trim() || undefined,
      style
    };

    logger.info('Starting AI image generation', 'AIImageBlender', 'generate_start', {
      baseImageUrl: selectedImage.url,
      hasUserImage: !!userImage,
      hasText: !!text.trim(),
      hasPrompt: !!prompt.trim(),
      style
    });

    logUserAction('ai_image_generation_started', 'AIImageBlender', {
      style,
      hasCustomizations: !!(userImage || text.trim() || prompt.trim())
    });

    try {
      const result = await aiImage.blendImages(request);
      
      if (result.success) {
        logger.info('AI image generation successful', 'AIImageBlender', 'generate_success', {
          hasImageUrl: !!result.imageUrl,
          hasImageBlob: !!result.imageBlob
        });

        setGeneratedResult(result);
        setShowPreview(true);
        onImageGenerated(result);

        logUserAction('ai_image_generated', 'AIImageBlender', {
          success: true
        });
      } else {
        logger.warn('AI image generation failed', 'AIImageBlender', 'generate_failed', {
          error: result.error
        });
        setError(result.error || 'Failed to generate blended image');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      logger.error('AI image generation error', 'AIImageBlender', 'generate_error', {
        errorMessage
      });
      setError(errorMessage);
    } finally {
      endTimer();
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    // Reset form
    setUserImage(null);
    setText('');
    setPrompt('');
    setStyle('realistic');
    setError(null);
    setLoading(false);
    setGeneratedResult(null);
    setShowPreview(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    onClose();
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setGeneratedResult(null);
    handleClose();
  };

  const isFormValid = selectedImage && (userImage || text.trim() || prompt.trim());

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '600px' }
        }}
      >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MagicIcon color="primary" />
        AI Image Blender
        <IconButton
          onClick={handleClose}
          sx={{ ml: 'auto' }}
          disabled={loading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Base Image Preview */}
          {selectedImage && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Base Image
              </Typography>
              <Card sx={{ maxWidth: 200 }}>
                <CardMedia
                  component="img"
                  height="150"
                  image={selectedImage.url}
                  alt="Base image"
                  sx={{ objectFit: 'cover' }}
                />
              </Card>
            </Box>
          )}

          <Divider />

          {/* User Image Upload */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Your Image (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload an image from your device to blend with the selected image
            </Typography>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {!userImage ? (
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mb: 2 }}
              >
                Choose Image
              </Button>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Card sx={{ width: 100, height: 100 }}>
                  <CardMedia
                    component="img"
                    height="100"
                    image={previewUrl || ''}
                    alt="User uploaded image"
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
                <Box>
                  <Chip
                    label={userImage.name}
                    onDelete={handleRemoveImage}
                    deleteIcon={<CloseIcon />}
                    variant="outlined"
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    {(userImage.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Text Input */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Text (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Enter text to include in the blended image..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              variant="outlined"
            />
          </Box>

          <Divider />

          {/* AI Prompt */}
          <Box>
            <Typography variant="h6" gutterBottom>
              AI Enhancement Prompt (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Describe how you want the AI to enhance or modify the image (e.g., 'make it look like a vintage poster', 'add magical effects', 'transform into watercolor style')..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              variant="outlined"
            />
          </Box>

          {/* Style Selection */}
          <FormControl fullWidth>
            <InputLabel>Art Style</InputLabel>
            <Select
              value={style}
              label="Art Style"
              onChange={(e) => setStyle(e.target.value as any)}
            >
              <MenuItem value="realistic">Realistic</MenuItem>
              <MenuItem value="artistic">Artistic</MenuItem>
              <MenuItem value="cartoon">Cartoon</MenuItem>
              <MenuItem value="abstract">Abstract</MenuItem>
            </Select>
          </FormControl>

          {/* Error Display */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Info */}
          <Alert severity="info" icon={<ImageIcon />}>
            The AI will blend your selected image with any uploaded image, text, and apply your chosen style and prompt to create a unique result.
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={!isFormValid || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <MagicIcon />}
        >
          {loading ? 'Generating...' : 'Generate Blended Image'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* AI Image Preview Dialog */}
    {generatedResult && (
      <AIImagePreviewDialog
        open={showPreview}
        onClose={handleClosePreview}
        result={generatedResult}
      />
    )}
    </>
  );
};