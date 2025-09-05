import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  Palette as PaletteIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { PrintOptions, PrintOrderResult, ProductVariant } from '../types';
import { merchandiseService } from '../utils/printService';
import { collageService } from '../utils/collageService';
import MerchandiseSelector from './MerchandiseSelector';

interface CollagePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  imageBlob: Blob | null;
  imageUrl: string | null;
  isAIGenerated?: boolean;
}

const CollagePreviewDialog: React.FC<CollagePreviewDialogProps> = ({
  open,
  onClose,
  imageBlob,
  imageUrl,
  isAIGenerated = false,
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [showMerchandiseSelector, setShowMerchandiseSelector] = useState(false);
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    productType: 'poster',
    size: '18"×24"',
    material: 'matte',
    quantity: 1,
  });
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState<PrintOrderResult | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      name: '',
      address1: '',
      address2: '',
      city: '',
      state_code: '',
      country_code: 'US',
      zip: '',
    },
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const productCategories = merchandiseService.getProductCategories();

  const handleDownload = () => {
    if (imageBlob) {
      collageService.downloadCollage(imageBlob, 'collage-preview.png');
    }
  };

  const handleShowMerchandise = () => {
    setShowMerchandiseSelector(true);
  };

  const handleMerchandiseOrder = async (options: PrintOptions, variant: ProductVariant) => {
    if (!imageBlob) return;

    setIsOrdering(true);
    setShowOrderForm(true);
    setPrintOptions(options);
    
    try {
      const result = await merchandiseService.createMerchandiseOrder(
        imageBlob,
        options,
        customerInfo
      );
      setOrderResult(result);
    } catch (error) {
      setOrderResult({
        success: false,
        error: error instanceof Error ? error.message : 'Order failed',
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const handleQuickPosterOrder = () => {
    setCurrentTab(1);
    setShowOrderForm(true);
  };

  const handleCreateOrderLink = () => {
    if (imageBlob) {
      const posterCategory = merchandiseService.getProductCategory('poster');
      const variant = posterCategory?.variants[1]; // Medium poster
      if (variant) {
        const orderLink = merchandiseService.createOrderLink(imageBlob, printOptions, variant);
        window.open(orderLink, '_blank');
      }
    }
  };

  const handleClose = () => {
    setShowOrderForm(false);
    setOrderResult(null);
    setShowMerchandiseSelector(false);
    setCurrentTab(0);
    onClose();
  };

  if (showMerchandiseSelector) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        fullScreen={isMobile}
      >
        <MerchandiseSelector
          imageBlob={imageBlob}
          imageUrl={imageUrl}
          onOrderCreate={handleMerchandiseOrder}
          onClose={() => setShowMerchandiseSelector(false)}
        />
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {isAIGenerated ? '✨ Your AI Image is Ready!' : '🎨 Your Custom Collage is Ready!'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAIGenerated 
                ? 'Download your AI creation or order a professional print'
                : 'Download your creation or turn it into amazing merchandise'
              }
            </Typography>
          </Box>
          <Button
            onClick={handleClose}
            startIcon={<CloseIcon />}
            size="small"
            variant="outlined"
          >
            Close
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Enhanced Tabs */}
        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={(_, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
            sx={{ px: 3 }}
          >
            <Tab 
              icon={<PaletteIcon />} 
              label="Preview & Download" 
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            />
            <Tab 
              icon={<PrintIcon />} 
              label="Quick Poster Order" 
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            />
          </Tabs>
        </Paper>

        <Box sx={{ p: 3 }}>
          {/* Tab 0: Preview & Download */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              {/* Enhanced Image Preview */}
              <Grid item xs={12} md={8}>
                <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      🖼️ Your Collage Preview
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      High-resolution 1200×800px • Ready for printing
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
                    {imageUrl && (
                      <Box
                        component="img"
                        src={imageUrl}
                        alt="Collage preview"
                        sx={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '500px',
                          objectFit: 'contain',
                          borderRadius: 2,
                          boxShadow: 2,
                          backgroundColor: 'white',
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Action Panel */}
              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  {/* Download Options */}
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      📥 Download Options
                    </Typography>
                    <Stack spacing={2}>
                      <Button
                        onClick={handleDownload}
                        startIcon={<DownloadIcon />}
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{ 
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Download High-Res Image
                      </Button>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Perfect for social media, digital frames, or personal use
                      </Typography>
                    </Stack>
                  </Paper>

                  {/* Merchandise Options */}
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      🛍️ Turn Into Merchandise
                    </Typography>
                    
                    {/* Product Category Preview */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      {productCategories.slice(0, 6).map((category) => (
                        <Grid item xs={4} key={category.id}>
                          <Paper 
                            elevation={0}
                            sx={{ 
                              p: 1, 
                              textAlign: 'center',
                              backgroundColor: 'white',
                              borderRadius: 1,
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                            onClick={handleShowMerchandise}
                          >
                            <Typography variant="h6">{category.icon}</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                              {category.name}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

                    <Button
                      onClick={handleShowMerchandise}
                      startIcon={<ShoppingCartIcon />}
                      variant="contained"
                      color="secondary"
                      size="large"
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      Explore All Products
                    </Button>
                    
                    <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'center' }}>
                      <Chip label="T-Shirts" size="small" />
                      <Chip label="Mugs" size="small" />
                      <Chip label="Canvas" size="small" />
                      <Chip label="& More!" size="small" color="primary" />
                    </Stack>
                  </Paper>

                  {/* Quick Poster Order */}
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      🖼️ Quick Poster Order
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Get a professional poster print delivered to your door
                    </Typography>
                    <Stack spacing={1}>
                      <Button
                        onClick={handleQuickPosterOrder}
                        startIcon={<PrintIcon />}
                        variant="outlined"
                        size="large"
                        fullWidth
                        sx={{ textTransform: 'none' }}
                      >
                        Order Poster Print
                      </Button>
                      <Button
                        onClick={handleCreateOrderLink}
                        startIcon={<ShippingIcon />}
                        variant="text"
                        size="small"
                        fullWidth
                        sx={{ textTransform: 'none' }}
                      >
                        📧 Email Order Request
                      </Button>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Quick Poster Order */}
          {currentTab === 1 && (

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {/* Poster Preview */}
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    🖼️ Poster Preview
                  </Typography>
                  {imageUrl && (
                    <Box
                      component="img"
                      src={imageUrl}
                      alt="Poster preview"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Poster Configuration */}
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    🖨️ Poster Options
                  </Typography>

                  <Stack spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Size</InputLabel>
                      <Select
                        value={printOptions.size}
                        label="Size"
                        onChange={(e) =>
                          setPrintOptions({
                            ...printOptions,
                            size: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="12x18">Small - 12"×18" - $15.95</MenuItem>
                        <MenuItem value="18x24">Medium - 18"×24" - $19.95</MenuItem>
                        <MenuItem value="24x36">Large - 24"×36" - $24.95</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Paper Type</InputLabel>
                      <Select
                        value={printOptions.material}
                        label="Paper Type"
                        onChange={(e) =>
                          setPrintOptions({
                            ...printOptions,
                            material: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="matte">Matte Finish</MenuItem>
                        <MenuItem value="glossy">Glossy Finish</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Quantity"
                      type="number"
                      value={printOptions.quantity}
                      onChange={(e) =>
                        setPrintOptions({
                          ...printOptions,
                          quantity: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      inputProps={{ min: 1, max: 10 }}
                      fullWidth
                    />

                    <Divider />

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Estimated Total: $19.95
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        + shipping (calculated at checkout)
                      </Typography>
                    </Box>

                    <Alert severity="info">
                      🚚 Free shipping on orders over $50!
                    </Alert>

                    <Divider />

                    {/* Order Buttons */}
                    <Stack spacing={2}>
                      <Button
                        onClick={handleQuickPosterOrder}
                        startIcon={<PrintIcon />}
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        sx={{
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        🛒 Order Poster Print - $19.95
                      </Button>
                      
                      <Button
                        onClick={handleCreateOrderLink}
                        startIcon={<ShippingIcon />}
                        variant="outlined"
                        size="medium"
                        fullWidth
                        sx={{ textTransform: 'none' }}
                      >
                        📧 Email Order Request
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}

        </Box>

        {/* Order Form Modal */}
        {showOrderForm && (
          <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                📦 Shipping Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Full Name"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, email: e.target.value })
                    }
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    value={customerInfo.address.address1}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: { ...customerInfo.address, address1: e.target.value },
                      })
                    }
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="City"
                    value={customerInfo.address.city}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: { ...customerInfo.address, city: e.target.value },
                      })
                    }
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField
                    label="State"
                    value={customerInfo.address.state_code}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: { ...customerInfo.address, state_code: e.target.value },
                      })
                    }
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField
                    label="ZIP Code"
                    value={customerInfo.address.zip}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: { ...customerInfo.address, zip: e.target.value },
                      })
                    }
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => setShowOrderForm(false)}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {/* Handle order submission */}}
                  disabled={isOrdering || !customerInfo.name || !customerInfo.email}
                  startIcon={isOrdering ? <CircularProgress size={20} /> : <PrintIcon />}
                  variant="contained"
                  color="primary"
                >
                  {isOrdering ? 'Processing...' : 'Place Order'}
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Order Result */}
        {orderResult && (
          <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              {orderResult.success ? (
                <Alert severity="success">
                  <Typography variant="h6" gutterBottom>
                    🎉 Order Created Successfully!
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Order ID: {orderResult.orderId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    You'll receive a confirmation email shortly with tracking information.
                  </Typography>
                  {orderResult.orderUrl && (
                    <Button
                      href={orderResult.orderUrl}
                      target="_blank"
                      variant="contained"
                      size="small"
                    >
                      View Order Details
                    </Button>
                  )}
                </Alert>
              ) : (
                <Alert severity="error">
                  <Typography variant="h6" gutterBottom>
                    ❌ Order Failed
                  </Typography>
                  <Typography variant="body2">
                    {orderResult.error}
                  </Typography>
                  <Button
                    onClick={() => setOrderResult(null)}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Try Again
                  </Button>
                </Alert>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CollagePreviewDialog;